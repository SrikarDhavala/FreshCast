import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryPicker } from '@/components/add-item/CategoryPicker';
import { GlassCard } from '@/components/ui/GlassCard';
import { FormField } from '@/components/ui/FormField';
import { categoryEmoji } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors, gradients } from '@/theme/colors';

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const { addProduct } = useInventory();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('dairy');
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  const canSave = name.trim().length > 0 && quantity.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addProduct({
      name: name.trim(),
      categoryId,
      emoji: categoryEmoji[categoryId] ?? '🍽️',
      quantity: quantity.trim(),
      expiryDate: expiryDate.toISOString(),
    });
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
                <Text className="text-white text-xl font-bold">Add Item</Text>
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

                  <FormField
                    label="Quantity"
                    placeholder="e.g. 500 g"
                    value={quantity}
                    onChangeText={setQuantity}
                    returnKeyType="done"
                  />

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
                    Add to Kitchen
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
