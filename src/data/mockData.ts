export type Category = {
  id: string;
  slug?: string;
  name: string;
  icon: keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap;
  color: string;
  emoji?: string;
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
  { id: 'dairy', slug: 'dairy', name: 'Dairy', icon: 'water', color: '#6BFFB8', emoji: '🥛' },
  { id: 'produce', slug: 'produce', name: 'Produce', icon: 'leaf', color: '#2BFF9C', emoji: '🥦' },
  { id: 'meat', slug: 'meat', name: 'Meat & Fish', icon: 'restaurant', color: '#0DED84', emoji: '🍗' },
  { id: 'pantry', slug: 'pantry', name: 'Pantry', icon: 'file-tray-stacked', color: '#9FF6D4', emoji: '🥫' },
  { id: 'frozen', slug: 'frozen', name: 'Frozen', icon: 'snow', color: '#6BFFB8', emoji: '🧊' },
  { id: 'beverages', slug: 'beverages', name: 'Beverages', icon: 'wine', color: '#2BFF9C', emoji: '🧃' },
  { id: 'bakery', slug: 'bakery', name: 'Bakery', icon: 'pizza', color: '#0BC46C', emoji: '🍞' },
  { id: 'spices', slug: 'spices', name: 'Spices', icon: 'flame', color: '#0DED84', emoji: '🌶️' },
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

export const CATEGORY_ICONS: (keyof typeof import('@expo/vector-icons/Ionicons').default.glyphMap)[] = [
  'water',
  'leaf',
  'restaurant',
  'file-tray-stacked',
  'snow',
  'wine',
  'pizza',
  'flame',
  'cafe',
  'nutrition',
  'fast-food',
  'ice-cream',
  'basket',
  'cube',
  'fish',
  'sparkles',
];

export const CATEGORY_COLORS = [
  '#6BFFB8',
  '#2BFF9C',
  '#0DED84',
  '#9FF6D4',
  '#38BDF8',
  '#A78BFA',
  '#F472B6',
  '#FBBF24',
  '#FB7185',
];

export const CATEGORY_EMOJIS = [
  '🥛', '🥦', '🍗', '🥫', '🧊', '🧃', '🍞', '🌶️',
  '🍎', '🧀', '🥚', '🍜', '🍪', '🍫', '☕', '🥜',
  '🍚', '🥗', '🐟', '🍯',
];