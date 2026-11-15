import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Recipe } from '@/data/mockData';
import { colors } from '@/theme/colors';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
    const router = useRouter();
    const expiringCount = recipe.expiringIngredientsUsed?.length ?? 0;
    const totalIngredients =
        (recipe.inventoryIngredients?.length ?? 0) + (recipe.extraIngredients?.length ?? 0);

    return (
        <Pressable onPress={() => router.push({ pathname: '/recipe-details', params: { id: recipe.id } })}>
            {({ pressed }) => (
                <GlassCard
                    radius={22}
                    style={{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }}
                >
                    <View className="flex-row items-center gap-3 px-4 py-3.5">
                        <View
                            style={{ backgroundColor: `${colors.mint[400]}22` }}
                            className="h-12 w-12 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-2xl">{recipe.emoji || '🍽️'}</Text>
                        </View>

                        <View className="flex-1 gap-1 pr-1">
                            <Text className="text-white text-[15px] font-semibold" numberOfLines={1}>
                                {recipe.title}
                            </Text>
                            <Text className="text-ink-300 text-xs" numberOfLines={1}>
                                {recipe.prepTime} · {totalIngredients} ingredients
                            </Text>
                        </View>

                        <View className="items-end gap-1.5">
                            {expiringCount > 0 ? (
                                <View
                                    style={{
                                        backgroundColor: `${colors.status.soon}1F`,
                                        borderColor: `${colors.status.soon}4D`,
                                    }}
                                    className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border"
                                >
                                    <Ionicons name="flame" size={11} color={colors.status.soon} />
                                    <Text style={{ color: colors.status.soon }} className="text-[11px] font-bold">
                                        Uses {expiringCount} expiring
                                    </Text>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        backgroundColor: `${colors.mint[400]}1A`,
                                        borderColor: `${colors.mint[400]}40`,
                                    }}
                                    className="px-2.5 py-1 rounded-full border"
                                >
                                    <Text style={{ color: colors.mint[300] }} className="text-[11px] font-semibold">
                                        In Stock
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </GlassCard>
            )}
        </Pressable>
    );
}