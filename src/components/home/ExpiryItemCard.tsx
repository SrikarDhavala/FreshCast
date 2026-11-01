import { Pressable, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { categories, type Product } from '@/data/mockData';

export function ExpiryItemCard({ product }: { product: Product }) {
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <Pressable>
      {({ pressed }) => (
        <GlassCard
          radius={22}
          style={{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }}
        >
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View
              style={{ backgroundColor: `${category?.color ?? '#2BFF9C'}22` }}
              className="h-12 w-12 rounded-2xl items-center justify-center"
            >
              <Text className="text-2xl">{product.emoji}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-white text-[15px] font-semibold">{product.name}</Text>
              <Text className="text-ink-300 text-xs">
                {category?.name} · {product.quantity}
              </Text>
            </View>
            <View className="items-end gap-1.5">
              <StatusBadge expiryDate={product.expiryDate} />
            </View>
          </View>
        </GlassCard>
      )}
    </Pressable>
  );
}
