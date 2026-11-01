import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { categories as categoryList, type Product } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext'; // Import Auth to get the current user

// Update this to your local IP address
const API_URL = 'http://192.168.1.3:8000/api/inventory';

export type NewProduct = {
  name: string;
  categoryId: string;
  emoji: string;
  quantity: string;
  expiryDate: string;
};

type InventoryContextValue = {
  products: Product[];
  addProduct: (product: NewProduct) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  categoryCounts: Record<string, number>;
  fetchProducts: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  // 1. Get the current user from your AuthContext
  const { user } = useAuth();

  // 2. Fetch items ONLY for the logged-in user
  const fetchProducts = useCallback(async () => {
    if (!user?.email) {
      setProducts([]); // Wipe inventory clean if no user is logged in
      return;
    }

    try {
      // Append the userEmail as a query parameter
      const res = await fetch(`${API_URL}?userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching inventory from MongoDB:', error);
    }
  }, [user]);

  // Refetch automatically whenever the logged-in user changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Include userEmail when adding a new item
  const addProduct = useCallback(async (product: NewProduct) => {
    if (!user?.email) return;

    try {
      const payload = {
        ...product,
        userEmail: user.email, // Attach the user to the item
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to save product');
      }

      const newSavedProduct = await res.json();
      setProducts((prev) => [newSavedProduct, ...prev]);
    } catch (error) {
      console.error('Error saving product to MongoDB:', error);
    }
  }, [user]);

  const removeProduct = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product from MongoDB:', error);
    }
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of categoryList) counts[category.id] = 0;
    for (const product of products) {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const value = useMemo(
    () => ({ products, addProduct, removeProduct, categoryCounts, fetchProducts }),
    [products, addProduct, removeProduct, categoryCounts, fetchProducts],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return ctx;
}