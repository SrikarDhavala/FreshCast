import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { categories as defaultCategories, type Category, type Product, type Recipe } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

// Update this to your local IP address (without /api/inventory at the end)
const BASE_URL = 'http://192.168.1.11:8000';
const INVENTORY_URL = `${BASE_URL}/api/inventory`;
const CATEGORIES_URL = `${BASE_URL}/api/categories`;
const RECIPES_URL = `${BASE_URL}/api/recipes`;

export type NewProduct = {
  name: string;
  categoryId: string;
  emoji: string;
  quantity: string;
  expiryDate: string;
};

export type NewCategory = {
  name: string;
  icon: Category['icon'];
  color: string;
  emoji: string;
};

type InventoryContextValue = {
  products: Product[];
  categories: Category[];
  recipes: Recipe[];
  isGeneratingRecipes: boolean;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (id: string, product: NewProduct) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addCategory: (category: NewCategory) => Promise<void>;
  updateCategory: (id: string, category: NewCategory) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  findCategory: (categoryId?: string) => Category | undefined;
  categoryCounts: Record<string, number>;
  fetchProducts: () => Promise<void>;
  generateRecipes: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user?.email) {
      setProducts([]);
      return;
    }

    try {
      const res = await fetch(`${INVENTORY_URL}?userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching inventory from MongoDB:', error);
    }
  }, [user]);

  const fetchCategories = useCallback(async () => {
    if (!user?.email) {
      setCategories(defaultCategories);
      return;
    }

    try {
      const res = await fetch(`${CATEGORIES_URL}?userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories from MongoDB:', error);
    }
  }, [user]);

  const fetchRecipes = useCallback(async () => {
    if (!user?.email) {
      setRecipes([]);
      return;
    }

    try {
      const res = await fetch(`${RECIPES_URL}?userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes ?? []);
      }
    } catch (error) {
      console.error('Error fetching cached recipes:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchRecipes();
  }, [fetchProducts, fetchCategories, fetchRecipes]);

  const generateRecipes = useCallback(async () => {
    if (!user?.email || isGeneratingRecipes) return;

    setIsGeneratingRecipes(true);
    try {
      const res = await fetch(`${RECIPES_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate recipes');
      }

      const data = await res.json();
      setRecipes(data.recipes ?? []);
    } finally {
      setIsGeneratingRecipes(false);
    }
  }, [user, isGeneratingRecipes]);

  const addProduct = useCallback(async (product: NewProduct) => {
    if (!user?.email) return;

    try {
      const res = await fetch(INVENTORY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, userEmail: user.email }),
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

  const updateProduct = useCallback(async (id: string, product: NewProduct) => {
    if (!user?.email) return;

    try {
      const res = await fetch(`${INVENTORY_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, userEmail: user.email }),
      });

      if (!res.ok) throw new Error('Failed to update product');

      const updatedSavedProduct = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedSavedProduct : p)));
    } catch (error) {
      console.error('Error updating product in MongoDB:', error);
    }
  }, [user]);

  const removeProduct = useCallback(async (id: string) => {
    try {
      await fetch(`${INVENTORY_URL}/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product from MongoDB:', error);
    }
  }, []);

  const addCategory = useCallback(async (category: NewCategory) => {
    if (!user?.email) return;

    try {
      const res = await fetch(CATEGORIES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, userEmail: user.email }),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const created = await res.json();
      setCategories((prev) => [...prev, created]);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }, [user]);

  const updateCategory = useCallback(async (id: string, category: NewCategory) => {
    if (!user?.email) return;

    try {
      const res = await fetch(`${CATEGORIES_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, userEmail: user.email }),
      });

      if (!res.ok) throw new Error('Failed to update category');

      const updated = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }, [user]);

  const removeCategory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${CATEGORIES_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }, []);

  // Matches by MongoDB ID first, falling back to legacy slug (e.g., 'dairy') for older items
  const findCategory = useCallback(
    (categoryId?: string) => {
      if (!categoryId) return undefined;
      return (
        categories.find((c) => c.id === categoryId || c.slug === categoryId) ??
        defaultCategories.find((c) => c.id === categoryId)
      );
    },
    [categories],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of categories) counts[category.id] = 0;
    for (const product of products) {
      const matched = findCategory(product.categoryId);
      const key = matched ? matched.id : product.categoryId;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [categories, products, findCategory]);

  const value = useMemo(
    () => ({
      products,
      categories,
      recipes,
      isGeneratingRecipes,
      generateRecipes,
      addProduct,
      updateProduct,
      removeProduct,
      addCategory,
      updateCategory,
      removeCategory,
      findCategory,
      categoryCounts,
      fetchProducts,
    }),
    [
      products,
      categories,
      recipes,
      isGeneratingRecipes,
      generateRecipes,
      addProduct,
      updateProduct,
      removeProduct,
      addCategory,
      updateCategory,
      removeCategory,
      findCategory,
      categoryCounts,
      fetchProducts,
    ],
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