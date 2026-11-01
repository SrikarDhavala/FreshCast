import { useState } from 'react';
import { ScrollView, Text, View, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { SearchBar } from '@/components/ui/SearchBar';
import { categories } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors } from '@/theme/colors';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { categoryCounts } = useInventory();

  // Add state for category search
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View className="gap-1">
          <Text className="text-white text-2xl font-bold">Categories</Text>
          <Text className="text-ink-300 text-sm">Browse your kitchen by category</Text>
        </View>

        {/* Wire up the SearchBar */}
        <SearchBar
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View className="flex-row flex-wrap -m-1.5">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={categoryCounts[category.id] ?? 0}
              />
            ))
          ) : (
            <View className="w-full items-center py-10">
              <Ionicons name="grid-outline" size={32} color={colors.text.tertiary} />
              <Text className="text-ink-300 text-sm mt-3 text-center">
                No categories found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}