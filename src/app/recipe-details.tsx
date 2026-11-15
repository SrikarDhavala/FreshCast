import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { useInventory } from '@/store/inventory';
import { colors } from '@/theme/colors';

export default function RecipeDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { recipes } = useInventory();

    const recipe = recipes.find((r) => r.id === id);

    if (!recipe) {
        return (
            <ScreenBackground>
                <View className="flex-1 items-center justify-center gap-4">
                    <Text className="text-white text-lg font-semibold">Recipe not found</Text>
                    <Pressable
                        onPress={() => router.back()}
                        className="px-6 py-3 bg-white/10 rounded-full border border-white/20"
                    >
                        <Text className="text-white font-medium">Go Back</Text>
                    </Pressable>
                </View>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            {/* Header */}
            <View
                style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}
                className="flex-row items-center justify-between pb-4"
            >
                <Pressable
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20"
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </Pressable>
                <Text className="text-white text-lg font-semibold">Recipe Details</Text>
                <View className="h-10 w-10" />
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <Animated.View entering={FadeInDown.duration(500).springify()} className="items-center mt-1">
                    <View className="h-24 w-24 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-4">
                        <Text style={{ fontSize: 48 }}>{recipe.emoji || '🍽️'}</Text>
                    </View>
                    <Text className="text-white text-2xl font-bold text-center mb-2">{recipe.title}</Text>
                    <Text className="text-ink-300 text-sm text-center leading-5 px-2 mb-4">
                        {recipe.description}
                    </Text>

                    {/* Meta Pills */}
                    <View className="flex-row flex-wrap items-center justify-center gap-2.5">
                        <View
                            style={{ backgroundColor: colors.glass.fill, borderColor: colors.glass.border }}
                            className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border"
                        >
                            <Ionicons name="time-outline" size={14} color={colors.mint[300]} />
                            <Text className="text-white text-xs font-semibold">{recipe.prepTime}</Text>
                        </View>

                        <View
                            style={{ backgroundColor: colors.glass.fill, borderColor: colors.glass.border }}
                            className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border"
                        >
                            <Ionicons name="people-outline" size={14} color={colors.mint[300]} />
                            <Text className="text-white text-xs font-semibold">{recipe.servings}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Section 1: Ingredients From Your Kitchen */}
                <Animated.View entering={FadeInDown.duration(500).delay(80).springify()} className="gap-2.5">
                    <View className="flex-row items-center justify-between px-1">
                        <Text className="text-white text-base font-bold">From Your Kitchen</Text>
                        <Text className="text-mint-300 text-xs font-semibold">
                            {recipe.inventoryIngredients?.length ?? 0} available
                        </Text>
                    </View>

                    <GlassCard radius={22} style={{ padding: 16 }}>
                        {recipe.inventoryIngredients?.map((ing, index) => {
                            const isLast = index === recipe.inventoryIngredients.length - 1;
                            return (
                                <View
                                    key={`${ing.name}-${index}`}
                                    className={`flex-row items-center justify-between py-3 ${!isLast ? 'border-b border-white/10' : ''}`}
                                >
                                    <View className="flex-row items-center gap-2.5 flex-1 pr-3">
                                        <Ionicons
                                            name={ing.isExpiring ? 'flame' : 'checkmark-circle'}
                                            size={18}
                                            color={ing.isExpiring ? colors.status.soon : colors.mint[400]}
                                        />
                                        <View className="flex-1">
                                            <Text className="text-white text-sm font-semibold">{ing.name}</Text>
                                            {ing.isExpiring && (
                                                <Text style={{ color: colors.status.soon }} className="text-[11px] font-semibold">
                                                    Expiring soon — priority
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View
                                        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                        className="px-3 py-1 rounded-xl"
                                    >
                                        <Text className="text-white text-xs font-bold">{ing.quantity}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </GlassCard>
                </Animated.View>

                {/* Section 2: Additional Spices & Pantry Essentials */}
                {recipe.extraIngredients?.length > 0 && (
                    <Animated.View entering={FadeInDown.duration(500).delay(140).springify()} className="gap-2.5">
                        <View className="flex-row items-center justify-between px-1">
                            <Text className="text-white text-base font-bold">Spices & Essentials Needed</Text>
                            <Text className="text-ink-300 text-xs">
                                {recipe.extraIngredients.length} extra
                            </Text>
                        </View>

                        <GlassCard radius={22} style={{ padding: 16 }}>
                            {recipe.extraIngredients.map((extra, index) => {
                                const isLast = index === recipe.extraIngredients.length - 1;
                                return (
                                    <View
                                        key={`${extra.name}-${index}`}
                                        className={`flex-row items-center justify-between py-3 ${!isLast ? 'border-b border-white/10' : ''}`}
                                    >
                                        <View className="flex-row items-center gap-2.5 flex-1 pr-3">
                                            <Ionicons name="add-circle-outline" size={18} color={colors.text.tertiary} />
                                            <Text className="text-ink-200 text-sm font-medium">{extra.name}</Text>
                                        </View>

                                        <View
                                            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                            className="px-3 py-1 rounded-xl"
                                        >
                                            <Text className="text-ink-200 text-xs font-semibold">{extra.quantity}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </GlassCard>
                    </Animated.View>
                )}

                {/* Section 3: Step-by-Step Instructions */}
                <Animated.View entering={FadeInDown.duration(500).delay(200).springify()} className="gap-2.5">
                    <Text className="text-white text-base font-bold px-1">Instructions</Text>

                    <View className="gap-3">
                        {recipe.instructions?.map((step, index) => (
                            <GlassCard key={index} radius={20} style={{ padding: 16 }}>
                                <View className="flex-row items-start gap-3.5">
                                    <View
                                        style={{ backgroundColor: `${colors.mint[400]}22` }}
                                        className="h-7 w-7 rounded-full items-center justify-center mt-0.5"
                                    >
                                        <Text style={{ color: colors.mint[300] }} className="text-xs font-extrabold">
                                            {index + 1}
                                        </Text>
                                    </View>
                                    <Text className="flex-1 text-ink-200 text-sm leading-5">{step}</Text>
                                </View>
                            </GlassCard>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </ScreenBackground>
    );
}