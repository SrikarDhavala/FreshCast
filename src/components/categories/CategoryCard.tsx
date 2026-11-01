import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Category } from '@/data/mockData';

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Pressable className="w-1/2 p-1.5">
      {({ pressed }) => (
        <GlassCard
          radius={24}
          style={{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }}
        >
          <View className="px-4 py-5 gap-4">
            <View
              style={{ backgroundColor: `${category.color}22` }}
              className="h-12 w-12 rounded-2xl items-center justify-center"
            >
              <Ionicons name={category.icon} size={22} color={category.color} />
            </View>
            <View className="gap-0.5">
              <Text className="text-white text-[15px] font-semibold">{category.name}</Text>
              <Text className="text-ink-300 text-xs">{count} items</Text>
            </View>
          </View>
        </GlassCard>
      )}
    </Pressable>
  );
}
