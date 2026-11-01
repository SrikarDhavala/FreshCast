import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { useInventory } from '@/store/inventory';
import { categories } from '@/data/mockData';
import { colors, gradients } from '@/theme/colors';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { products, removeProduct } = useInventory();

    const item = products.find((p) => p.id === id);
    const category = categories.find((c) => c.id === item?.categoryId);

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

            <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }} showsVerticalScrollIndicator={false}>
                {/* Visual Header */}
                <Animated.View entering={FadeInDown.duration(600).springify()} className="items-center mt-4">
                    <View className="h-32 w-32 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-6">
                        <Text style={{ fontSize: 64 }}>{item.emoji}</Text>
                    </View>
                    <Text className="text-white text-3xl font-bold mb-2 text-center">{item.name}</Text>

                    {category && (
                        <View className="flex-row items-center px-4 py-1.5 rounded-full border border-white/10 mt-1" style={{ backgroundColor: `${category.color}20` }}>
                            <Ionicons name={category.icon} size={14} color={category.color} style={{ marginRight: 6 }} />
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

                {/* Actions */}
                <Animated.View entering={FadeInDown.duration(600).delay(200).springify()} className="gap-4 mt-6">
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