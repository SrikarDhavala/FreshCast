import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { useInventory } from '@/store/inventory';
import { colors, gradients } from '@/theme/colors';

const BACKEND_URL = 'http://192.168.1.11:8000';

type NutritionData = {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    summary: string;
};

function MacroCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View className="w-[48%] p-3.5 rounded-2xl border border-white/5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <Text className="text-ink-300 text-[11px] font-bold uppercase tracking-wider mb-1">{label}</Text>
            <Text className="text-white text-lg font-extrabold" style={{ color }}>{value}</Text>
        </View>
    );
}

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { products, removeProduct, findCategory } = useInventory();

    const [nutrition, setNutrition] = useState<NutritionData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const item = products.find((p) => p.id === id);
    const category = findCategory(item?.categoryId);

    if (!item) {
        return (
            <ScreenBackground>
                <View className="flex-1 items-center justify-center gap-4">
                    <Text className="text-white text-lg font-semibold">Item not found</Text>
                    <Pressable onPress={() => router.back()} className="px-6 py-3 bg-white/10 rounded-full border border-white/20">
                        <Text className="text-white font-medium">Go Back</Text>
                    </Pressable>
                </View>
            </ScreenBackground>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to throw away ${item.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await removeProduct(item.id);
                        router.back();
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        router.push({ pathname: '/edit-item', params: { id: item.id } });
    };

    const fetchAINutrition = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/ai/nutrition`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.name,
                    quantity: item.quantity,
                    category: category?.name || 'Food',
                }),
            });

            if (!res.ok) throw new Error('AI analysis failed');

            const data = await res.json();
            setNutrition(data);
        } catch (error) {
            console.error(error);
            Alert.alert('AI Error', 'Could not analyze nutrition right now. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <ScreenBackground>
            {/* Header */}
            <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }} className="flex-row items-center justify-between pb-4">
                <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20">
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </Pressable>
                <Text className="text-white text-lg font-semibold">Item Details</Text>
                <View className="h-10 w-10" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
                {/* Visual Header */}
                <Animated.View entering={FadeInDown.duration(600).springify()} className="items-center mt-2">
                    <View className="h-28 w-28 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-5">
                        <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
                    </View>
                    <Text className="text-white text-3xl font-bold mb-2 text-center">{item.name}</Text>

                    {category && (
                        <View className="flex-row items-center px-4 py-1.5 rounded-full border border-white/10 mt-1" style={{ backgroundColor: `${category.color}20` }}>
                            <Ionicons name={category.icon as any} size={14} color={category.color} style={{ marginRight: 6 }} />
                            <Text style={{ color: category.color, fontWeight: '600', fontSize: 13 }}>{category.name}</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Info Card */}
                <Animated.View entering={FadeInDown.duration(600).delay(100).springify()}>
                    <GlassCard radius={24} style={{ padding: 20 }}>
                        <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                            <Text className="text-ink-300 text-base">Quantity</Text>
                            <Text className="text-white text-base font-semibold">{item.quantity}</Text>
                        </View>

                        <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                            <Text className="text-ink-300 text-base">Expiry Date</Text>
                            <Text className="text-white text-base font-semibold">{new Date(item.expiryDate).toLocaleDateString()}</Text>
                        </View>

                        <View className="flex-row justify-between items-center py-3">
                            <Text className="text-ink-300 text-base">Added On</Text>
                            <Text className="text-white text-base font-semibold">
                                {item.addedDate ? new Date(item.addedDate).toLocaleDateString() : 'Unknown'}
                            </Text>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* AI Nutrition Section */}
                <Animated.View layout={Layout.springify()} entering={FadeInDown.duration(600).delay(150).springify()}>
                    {!nutrition && !isAnalyzing ? (
                        <Pressable onPress={fetchAINutrition}>
                            <GlassCard radius={24} style={{ padding: 20, borderColor: 'rgba(43,255,156,0.25)', borderWidth: 1 }}>
                                <View className="flex-row items-center justify-center gap-2.5">
                                    <Ionicons name="sparkles" size={20} color={colors.mint[400]} />
                                    <Text className="text-white text-base font-bold">Analyze Nutrition with AI</Text>
                                </View>
                            </GlassCard>
                        </Pressable>
                    ) : isAnalyzing ? (
                        <GlassCard radius={24} style={{ padding: 32, alignItems: 'center', borderColor: 'rgba(43,255,156,0.1)', borderWidth: 1 }}>
                            <ActivityIndicator color={colors.mint[400]} size="large" />
                            <Text className="text-ink-300 mt-4 text-sm font-medium">Gemini is analyzing {item.name}...</Text>
                        </GlassCard>
                    ) : nutrition && (
                        <Animated.View entering={FadeInDown.duration(500)}>
                            <GlassCard radius={24} style={{ padding: 20 }}>
                                <View className="flex-row items-center gap-2 mb-5">
                                    <Ionicons name="sparkles" size={18} color={colors.mint[400]} />
                                    <Text className="text-white text-lg font-bold">AI Nutrition Facts</Text>
                                </View>

                                <View className="flex-row flex-wrap justify-between gap-y-3">
                                    <MacroCard label="Calories" value={nutrition.calories} color="#FFD60A" />
                                    <MacroCard label="Protein" value={nutrition.protein} color="#FF375F" />
                                    <MacroCard label="Carbs" value={nutrition.carbs} color="#30D158" />
                                    <MacroCard label="Fats" value={nutrition.fat} color="#0A84FF" />
                                </View>

                                <View className="mt-5 p-4 rounded-xl border border-white/5" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <Text className="text-ink-300 text-sm leading-5 font-medium">{nutrition.summary}</Text>
                                </View>
                            </GlassCard>
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeInDown.duration(600).delay(200).springify()} className="gap-4 mt-2">
                    <Pressable onPress={handleEdit}>
                        <LinearGradient
                            colors={gradients.brand}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text className="text-lg font-bold" style={{ color: '#04120E' }}>Edit Item</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable onPress={handleDelete} className="h-14 rounded-full items-center justify-center border border-red-500/30 bg-red-500/10">
                        <Text className="text-red-400 text-lg font-bold">Delete Item</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </ScreenBackground>
    );
}