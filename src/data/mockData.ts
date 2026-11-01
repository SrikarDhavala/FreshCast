export type Category = {
  id: string;
  name: string;
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  emoji: string;
  quantity: string;
  expiryDate: string;
  addedDate: string;
};

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const categories: Category[] = [
  { id: 'dairy', name: 'Dairy', icon: 'water', color: '#6BFFB8' },
  { id: 'produce', name: 'Produce', icon: 'leaf', color: '#2BFF9C' },
  { id: 'meat', name: 'Meat & Fish', icon: 'restaurant', color: '#0DED84' },
  { id: 'pantry', name: 'Pantry', icon: 'file-tray-stacked', color: '#9FF6D4' },
  { id: 'frozen', name: 'Frozen', icon: 'snow', color: '#6BFFB8' },
  { id: 'beverages', name: 'Beverages', icon: 'wine', color: '#2BFF9C' },
  { id: 'bakery', name: 'Bakery', icon: 'pizza', color: '#0BC46C' },
  { id: 'spices', name: 'Spices', icon: 'flame', color: '#0DED84' },
];

export const categoryEmoji: Record<string, string> = {
  dairy: '🥛',
  produce: '🥦',
  meat: '🍗',
  pantry: '🥫',
  frozen: '🧊',
  beverages: '🧃',
  bakery: '🍞',
  spices: '🌶️',
};

export const products: Product[] = [
  { id: '1', name: 'Greek Yogurt', categoryId: 'dairy', emoji: '🥛', quantity: '500 g', expiryDate: isoDaysFromNow(1), addedDate: isoDaysFromNow(-6) },
  { id: '2', name: 'Fresh Spinach', categoryId: 'produce', emoji: '🥬', quantity: '200 g', expiryDate: isoDaysFromNow(2), addedDate: isoDaysFromNow(-2) },
  { id: '3', name: 'Chicken Breast', categoryId: 'meat', emoji: '🍗', quantity: '1 kg', expiryDate: isoDaysFromNow(0), addedDate: isoDaysFromNow(-1) },
  { id: '4', name: 'Cherry Tomatoes', categoryId: 'produce', emoji: '🍅', quantity: '250 g', expiryDate: isoDaysFromNow(4), addedDate: isoDaysFromNow(-3) },
  { id: '5', name: 'Whole Milk', categoryId: 'dairy', emoji: '🥛', quantity: '1 L', expiryDate: isoDaysFromNow(5), addedDate: isoDaysFromNow(-4) },
  { id: '6', name: 'Sourdough Bread', categoryId: 'bakery', emoji: '🍞', quantity: '1 loaf', expiryDate: isoDaysFromNow(-1), addedDate: isoDaysFromNow(-5) },
  { id: '7', name: 'Cheddar Cheese', categoryId: 'dairy', emoji: '🧀', quantity: '300 g', expiryDate: isoDaysFromNow(14), addedDate: isoDaysFromNow(-2) },
  { id: '8', name: 'Frozen Peas', categoryId: 'frozen', emoji: '🟢', quantity: '400 g', expiryDate: isoDaysFromNow(90), addedDate: isoDaysFromNow(-10) },
  { id: '9', name: 'Orange Juice', categoryId: 'beverages', emoji: '🧃', quantity: '1 L', expiryDate: isoDaysFromNow(8), addedDate: isoDaysFromNow(-1) },
  { id: '10', name: 'Basmati Rice', categoryId: 'pantry', emoji: '🍚', quantity: '5 kg', expiryDate: isoDaysFromNow(200), addedDate: isoDaysFromNow(-20) },
];

export const user = {
  name: 'Alex Rivera',
  email: 'alex.rivera@email.com',
  householdSize: 3,
  memberSince: 'Jan 2025',
};
