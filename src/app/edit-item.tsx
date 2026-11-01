import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryPicker } from '@/components/add-item/CategoryPicker';
import { GlassCard } from '@/components/ui/GlassCard';
import { FormField } from '@/components/ui/FormField';
import { categoryEmoji } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors, gradients } from '@/theme/colors';

const UNITS = ['pkts', 'pcs', 'g', 'kg', 'ml', 'L'];

function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EditItemScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { products, updateProduct } = useInventory();

    const existingItem = products.find((p) => p.id === id);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('pkts');
    const [categoryId, setCategoryId] = useState('dairy');
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (existingItem) {
            setName(existingItem.name);
            setCategoryId(existingItem.categoryId);
            setExpiryDate(new Date(existingItem.expiryDate));

            // Safely split strings like "500 g" into "500" and "g"
            const match = existingItem.quantity.match(/^([\d.]+)\s*(.*)$/);
            if (match) {
                setAmount(match[1]);
                setUnit(match[2] || 'pkts');
            } else {
                setAmount(existingItem.quantity); // Fallback if it's text-only
                setUnit('pcs');
            }
        }
    }, [existingItem]);

    // Combine custom units dynamically just in case they used something weird before
    const allUnits = Array.from(new Set([...UNITS, unit])).filter(Boolean);

    const canSave = name.trim().length > 0 && amount.trim().length > 0;

    const handleSave = () => {
        if (!canSave || !existingItem) return;
        updateProduct(existingItem.id, {
            name: name.trim(),
            categoryId,
            emoji: categoryEmoji[categoryId] ?? '🍽️',
            quantity: `${amount.trim()} ${unit}`,
            expiryDate: expiryDate.toISOString(),
        });
        router.back();
    };

    if (!existingItem) return null;

    return (
        <View style={{ flex: 1 }}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,6,3,0.95)' }]}
                />
            </Pressable>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                pointerEvents="box-none"
                style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}
            >
                <Animated.View
                    entering={ZoomIn.duration(260).springify().damping(150)}
                    style={{ maxHeight: '86%', flexShrink: 1 }}
                >
                    <GlassCard radius={28} intensity={95} style={{ maxHeight: '100%', flexShrink: 1 }}>
                        <View
                            style={{
                                paddingTop: 20,
                                paddingHorizontal: 20,
                                paddingBottom: insets.bottom > 0 ? 20 : 24,
                                flexShrink: 1,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-5">
                                <Text className="text-white text-xl font-bold">Edit Item</Text>
                                <Pressable
                                    onPress={() => router.back()}
                                    className="h-8 w-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: colors.glass.fillStrong }}
                                >
                                    <Ionicons name="close" size={16} color={colors.text.primary} />
                                </Pressable>
                            </View>

                            <ScrollView
                                style={{ flexShrink: 1 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled">
                                <View className="gap-5">
                                    <FormField
                                        label="Item name"
                                        placeholder="e.g. Greek Yogurt"
                                        value={name}
                                        onChangeText={setName}
                                        returnKeyType="next"
                                    />

                                    {/* --- NEW AMOUNT & UNIT PICKER ROW --- */}
                                    <View className="gap-2">
                                        <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Quantity & Unit</Text>
                                        <View className="flex-row gap-3">
                                            <View className="flex-1">
                                                <GlassCard radius={16}>
                                                    <TextInput
                                                        value={amount}
                                                        onChangeText={setAmount}
                                                        placeholder="e.g. 2"
                                                        placeholderTextColor={colors.text.tertiary}
                                                        keyboardType="decimal-pad"
                                                        className="text-white text-[15px] px-4 py-3.5"
                                                    />
                                                </GlassCard>
                                            </View>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                className="flex-[1.5]"
                                                contentContainerStyle={{ gap: 8 }}
                                            >
                                                {allUnits.map((u) => (
                                                    <Pressable key={u} onPress={() => setUnit(u)}>
                                                        <GlassCard
                                                            radius={16}
                                                            style={{
                                                                backgroundColor: unit === u ? `${colors.mint[400]}25` : 'transparent',
                                                                borderColor: unit === u ? colors.mint[400] : 'rgba(255,255,255,0.1)',
                                                                borderWidth: 1,
                                                            }}
                                                        >
                                                            <View className="px-4 py-3.5 justify-center">
                                                                <Text style={{
                                                                    color: unit === u ? colors.mint[400] : colors.text.secondary,
                                                                    fontWeight: unit === u ? '600' : '400'
                                                                }}>
                                                                    {u}
                                                                </Text>
                                                            </View>
                                                        </GlassCard>
                                                    </Pressable>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                    {/* --- END NEW PICKER --- */}

                                    <View className="gap-2">
                                        <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Category</Text>
                                        <CategoryPicker value={categoryId} onChange={setCategoryId} />
                                    </View>

                                    <View className="gap-2">
                                        <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Expiry date</Text>
                                        <Pressable onPress={() => setShowPicker((prev) => !prev)}>
                                            <GlassCard radius={16}>
                                                <View className="flex-row items-center justify-between px-4 py-3.5">
                                                    <Text className="text-white text-[15px]">{formatDate(expiryDate)}</Text>
                                                    <Ionicons name="calendar" size={18} color={colors.mint[400]} />
                                                </View>
                                            </GlassCard>
                                        </Pressable>
                                        {showPicker && (
                                            <DateTimePicker
                                                value={expiryDate}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                                minimumDate={new Date()}
                                                onChange={(_event, selected) => {
                                                    if (Platform.OS === 'android') setShowPicker(false);
                                                    if (selected) setExpiryDate(selected);
                                                }}
                                            />
                                        )}
                                    </View>
                                </View>
                            </ScrollView>

                            <Pressable onPress={handleSave} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.4 }}>
                                <LinearGradient
                                    colors={gradients.brand}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        height: 52,
                                        borderRadius: 26,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 18,
                                    }}
                                >
                                    <Text className="text-base font-bold" style={{ color: '#04120E' }}>
                                        Save Changes
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </GlassCard>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}