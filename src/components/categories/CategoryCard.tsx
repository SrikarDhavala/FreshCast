import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Category } from '@/data/mockData';
import { colors } from '@/theme/colors';

type CategoryCardProps = {
  category: Category;
  count: number;
  isEditing?: boolean;
  onDelete?: (category: Category) => void;
};

export function CategoryCard({ category, count, isEditing = false, onDelete }: CategoryCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (isEditing) {
      router.push({ pathname: '/category-modal', params: { id: category.id } });
    } else {
      router.push({ pathname: '/category-details', params: { id: category.id } });
    }
  };

  return (
    <Pressable className="w-1/2 p-1.5" onPress={handlePress}>
      {({ pressed }) => (
        <GlassCard
          radius={24}
          style={{
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            borderColor: isEditing ? `${category.color}55` : undefined,
            borderWidth: isEditing ? 1 : 0,
          }}
        >
          <View className="px-4 py-5 gap-4">
            <View className="flex-row items-center justify-between">
              <View
                style={{ backgroundColor: `${category.color}22` }}
                className="h-12 w-12 rounded-2xl items-center justify-center"
              >
                <Ionicons name={category.icon} size={22} color={category.color} />
              </View>

              {isEditing && (
                <View className="flex-row items-center gap-1.5">
                  <View
                    style={{ backgroundColor: colors.glass.fillStrong }}
                    className="h-8 w-8 rounded-full items-center justify-center"
                  >
                    <Ionicons name="pencil" size={14} color={colors.mint[300]} />
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete?.(category);
                    }}
                    className="h-8 w-8 rounded-full items-center justify-center bg-red-500/20 border border-red-500/40"
                  >
                    <Ionicons name="trash-outline" size={14} color="#F87171" />
                  </Pressable>
                </View>
              )}
            </View>

            <View className="gap-0.5">
              <Text className="text-white text-[15px] font-semibold">{category.name}</Text>
              <Text className="text-ink-300 text-xs">
                {isEditing ? 'Tap to edit' : `${count} items`}
              </Text>
            </View>
          </View>
        </GlassCard>
      )}
    </Pressable>
  );
}