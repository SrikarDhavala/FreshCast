import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ExpiryItemCard } from '@/components/home/ExpiryItemCard';
import { useInventory } from '@/store/inventory';
import { categories } from '@/data/mockData';

export default function CategoryDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { products } = useInventory();

    // Find the selected category and its items
    const category = categories.find((c) => c.id === id);
    const categoryItems = products.filter((p) => p.categoryId === id);

    if (!category) return null;

    return (
        <ScreenBackground>
            {/* Header */}
            <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }} className="flex-row items-center pb-6">
                <Pressable
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20 mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </Pressable>
                <View className="flex-row items-center">
                    <View
                        style={{ backgroundColor: `${category.color}20` }}
                        className="h-10 w-10 rounded-xl items-center justify-center mr-3"
                    >
                        <Ionicons name={category.icon as any} size={20} color={category.color} />
                    </View>
                    <Text className="text-white text-xl font-bold">{category.name}</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
            >
                {categoryItems.length > 0 ? (
                    categoryItems.map((item) => (
                        <ExpiryItemCard key={item.id} product={item} />
                    ))
                ) : (
                    /* Empty State */
                    <View className="items-center justify-center py-24 px-6">
                        <View
                            style={{ backgroundColor: `${category.color}15` }}
                            className="h-24 w-24 rounded-full items-center justify-center mb-6"
                        >
                            <Ionicons name={category.icon as any} size={40} color={category.color} />
                        </View>
                        <Text className="text-white text-xl font-semibold mb-2">
                            No {category.name} Items
                        </Text>
                        <Text className="text-ink-300 text-center text-sm leading-5">
                            Your {category.name.toLowerCase()} inventory is currently empty. Tap the + button to add some fresh items here!
                        </Text>
                    </View>
                )}
            </ScrollView>
        </ScreenBackground>
    );
}