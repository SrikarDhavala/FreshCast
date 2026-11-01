import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { SearchBar } from '@/components/ui/SearchBar';
import { categories } from '@/data/mockData';
import { useInventory } from '@/store/inventory';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { categoryCounts } = useInventory();

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 140,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="text-white text-2xl font-bold">Categories</Text>
          <Text className="text-ink-300 text-sm">Browse your kitchen by category</Text>
        </View>

        <SearchBar placeholder="Search categories..." />

        <View className="flex-row flex-wrap -m-1.5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} count={categoryCounts[category.id] ?? 0} />
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
