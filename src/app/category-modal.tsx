import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormField } from '@/components/ui/FormField';
import { GlassCard } from '@/components/ui/GlassCard';
import { CATEGORY_COLORS, CATEGORY_EMOJIS, CATEGORY_ICONS, type Category } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors, gradients } from '@/theme/colors';

export default function CategoryModalScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const insets = useSafeAreaInsets();
    const { categories, addCategory, updateCategory } = useInventory();

    const existingCategory = id ? categories.find((c) => c.id === id) : undefined;
    const isEditing = Boolean(existingCategory);

    const [name, setName] = useState('');
    const [icon, setIcon] = useState<Category['icon']>('basket');
    const [color, setColor] = useState(CATEGORY_COLORS[1]);
    const [emoji, setEmoji] = useState('🍽️');

    useEffect(() => {
        if (existingCategory) {
            setName(existingCategory.name);
            setIcon(existingCategory.icon);
            setColor(existingCategory.color);
            setEmoji(existingCategory.emoji ?? '🍽️');
        }
    }, [existingCategory]);

    const canSave = name.trim().length > 0;

    const handleSave = async () => {
        if (!canSave) return;

        const payload = {
            name: name.trim(),
            icon,
            color,
            emoji,
        };

        if (isEditing && existingCategory) {
            await updateCategory(existingCategory.id, payload);
        } else {
            await addCategory(payload);
        }

        router.back();
    };

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
                    style={{ maxHeight: '88%', flexShrink: 1 }}
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
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white text-xl font-bold">
                                    {isEditing ? 'Edit Category' : 'New Category'}
                                </Text>
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
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="gap-5">
                                    {/* Live Preview */}
                                    <GlassCard radius={20}>
                                        <View className="flex-row items-center gap-3.5 p-3.5">
                                            <View
                                                style={{ backgroundColor: `${color}22` }}
                                                className="h-12 w-12 rounded-2xl items-center justify-center"
                                            >
                                                <Ionicons name={icon} size={22} color={color} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-white text-[15px] font-semibold">
                                                    {name.trim() || 'Category Preview'}
                                                </Text>
                                                <Text className="text-ink-300 text-xs mt-0.5">Default item emoji: {emoji}</Text>
                                            </View>
                                        </View>
                                    </GlassCard>

                                    <FormField
                                        label="Category name"
                                        placeholder="e.g. Snacks"
                                        value={name}
                                        onChangeText={setName}
                                        returnKeyType="done"
                                    />

                                    {/* Color Picker */}
                                    <View className="gap-2">
                                        <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Accent Color</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-2.5 px-1 py-1">
                                                {CATEGORY_COLORS.map((swatch) => {
                                                    const selected = color === swatch;
                                                    return (
                                                        <Pressable
                                                            key={swatch}
                                                            onPress={() => setColor(swatch)}
                                                            style={{
                                                                backgroundColor: swatch,
                                                                borderWidth: selected ? 3 : 0,
                                                                borderColor: '#FFFFFF',
                                                            }}
                                                            className="h-9 w-9 rounded-full items-center justify-center"
                                                        >
                                                            {selected && <Ionicons name="checkmark" size={16} color="#04120E" />}
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        </ScrollView>
                                    </View>

                                    {/* Icon Picker */}
                                    <View className="gap-2">
                                        <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Icon</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {CATEGORY_ICONS.map((iconName) => {
                                                const selected = icon === iconName;
                                                return (
                                                    <Pressable
                                                        key={iconName}
                                                        onPress={() => setIcon(iconName)}
                                                        style={{
                                                            backgroundColor: selected ? `${color}26` : colors.glass.fill,
                                                            borderColor: selected ? color : colors.glass.border,
                                                        }}
                                                        className="h-11 w-11 rounded-2xl border items-center justify-center"
                                                    >
                                                        <Ionicons
                                                            name={iconName}
                                                            size={20}
                                                            color={selected ? color : colors.text.secondary}
                                                        />
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Item Emoji Picker */}
                                    <View className="gap-2">
                                        <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Item Emoji</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-2 px-1">
                                                {CATEGORY_EMOJIS.map((itemEmoji) => {
                                                    const selected = emoji === itemEmoji;
                                                    return (
                                                        <Pressable
                                                            key={itemEmoji}
                                                            onPress={() => setEmoji(itemEmoji)}
                                                            style={{
                                                                backgroundColor: selected ? `${color}26` : colors.glass.fill,
                                                                borderColor: selected ? color : colors.glass.border,
                                                            }}
                                                            className="h-11 w-11 rounded-2xl border items-center justify-center"
                                                        >
                                                            <Text className="text-xl">{itemEmoji}</Text>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        </ScrollView>
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
                                        {isEditing ? 'Save Category' : 'Create Category'}
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