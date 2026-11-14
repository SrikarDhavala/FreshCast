import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { SearchBar } from '@/components/ui/SearchBar';
import type { Category } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors } from '@/theme/colors';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { categories, categoryCounts, removeCategory } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteCategory = (category: Category) => {
    const itemCount = categoryCounts[category.id] ?? 0;
    const warning =
      itemCount > 0
        ? `This category currently has ${itemCount} item(s). Deleting it won't delete the items, but they will be uncategorized.`
        : `Are you sure you want to delete "${category.name}"?`;

    Alert.alert('Delete Category', warning, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeCategory(category.id),
      },
    ]);
  };

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
        {/* Header with Top-Right Edit Button */}
        <View className="flex-row items-center justify-between">
          <View className="gap-1 flex-1 pr-3">
            <Text className="text-white text-2xl font-bold">Categories</Text>
            <Text className="text-ink-300 text-sm">
              {isEditing ? 'Tap a category to edit or add a new one' : 'Browse your kitchen by category'}
            </Text>
          </View>

          <Pressable onPress={() => setIsEditing((prev) => !prev)}>
            <GlassCard
              radius={20}
              style={{
                backgroundColor: isEditing ? `${colors.mint[400]}28` : undefined,
                borderColor: isEditing ? colors.mint[400] : colors.glass.borderStrong,
                borderWidth: 1,
              }}
            >
              <View className="flex-row items-center gap-1.5 px-4 py-2">
                <Ionicons
                  name={isEditing ? 'checkmark' : 'pencil'}
                  size={14}
                  color={isEditing ? colors.mint[300] : colors.text.primary}
                />
                <Text
                  style={{ color: isEditing ? colors.mint[300] : colors.text.primary }}
                  className="text-xs font-bold"
                >
                  {isEditing ? 'Done' : 'Edit'}
                </Text>
              </View>
            </GlassCard>
          </Pressable>
        </View>

        <SearchBar
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Add Category Banner in Edit Mode */}
        {isEditing && (
          <Pressable onPress={() => router.push('/category-modal')}>
            <GlassCard
              radius={20}
              style={{
                borderColor: 'rgba(43,255,156,0.35)',
                borderWidth: 1,
                borderStyle: 'dashed',
              }}
            >
              <View className="flex-row items-center justify-center gap-2 py-3.5 px-4">
                <Ionicons name="add-circle" size={20} color={colors.mint[400]} />
                <Text className="text-mint-300 text-sm font-bold">Add New Category</Text>
              </View>
            </GlassCard>
          </Pressable>
        )}

        <View className="flex-row flex-wrap -m-1.5">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={categoryCounts[category.id] ?? 0}
                isEditing={isEditing}
                onDelete={handleDeleteCategory}
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