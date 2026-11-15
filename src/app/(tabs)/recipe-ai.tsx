import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecipeCard } from '@/components/recipe-ai/RecipeCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { useInventory } from '@/store/inventory';
import { colors, gradients } from '@/theme/colors';
import { expiryStatus } from '@/utils/date';

export default function RecipeAiScreen() {
  const insets = useSafeAreaInsets();
  const { products, recipes, isGeneratingRecipes, generateRecipes } = useInventory();

  const freshProducts = products.filter((p) => expiryStatus(p.expiryDate) !== 'expired');
  const expiringProducts = products
    .filter((p) => ['urgent', 'soon'].includes(expiryStatus(p.expiryDate)))
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  const handleGenerate = async () => {
    if (freshProducts.length === 0) {
      Alert.alert(
        'Kitchen Empty',
        'Add some fresh ingredients to your inventory first so RecipeAI can build recipes around them.',
      );
      return;
    }

    try {
      await generateRecipes();
    } catch (error: any) {
      Alert.alert('RecipeAI', error?.message || 'Could not generate recipes right now.');
    }
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
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="gap-1 flex-1 pr-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-2xl font-bold">RecipeAI</Text>
              <Ionicons name="sparkles" size={18} color={colors.mint[400]} />
            </View>
            <Text className="text-ink-300 text-sm">
              Prioritizing ingredients expiring soon in your kitchen
            </Text>
          </View>

          {recipes.length > 0 && (
            <Pressable onPress={handleGenerate} disabled={isGeneratingRecipes}>
              <GlassCard
                radius={20}
                style={{
                  borderColor: 'rgba(43,255,156,0.35)',
                  borderWidth: 1,
                  opacity: isGeneratingRecipes ? 0.6 : 1,
                }}
              >
                <View className="flex-row items-center gap-1.5 px-3.5 py-2">
                  {isGeneratingRecipes ? (
                    <ActivityIndicator size="small" color={colors.mint[300]} />
                  ) : (
                    <Ionicons name="refresh" size={14} color={colors.mint[300]} />
                  )}
                  <Text style={{ color: colors.mint[300] }} className="text-xs font-bold">
                    {isGeneratingRecipes ? 'Cooking...' : 'Refresh'}
                  </Text>
                </View>
              </GlassCard>
            </Pressable>
          )}
        </View>

        {/* Expiring Priority Banner */}
        {expiringProducts.length > 0 && (
          <GlassCard
            radius={20}
            style={{
              borderColor: `${colors.status.soon}40`,
              borderWidth: 1,
            }}
          >
            <View className="px-4 py-3.5 flex-row items-center gap-3">
              <View
                style={{ backgroundColor: `${colors.status.soon}22` }}
                className="h-10 w-10 rounded-2xl items-center justify-center"
              >
                <Ionicons name="alert-circle" size={20} color={colors.status.soon} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-white text-xs font-bold uppercase tracking-wider">
                  Use Soon Priority
                </Text>
                <Text className="text-ink-200 text-xs leading-4" numberOfLines={2}>
                  {expiringProducts.map((p) => `${p.emoji} ${p.name}`).join('  ·  ')}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Loading State */}
        {isGeneratingRecipes && recipes.length === 0 ? (
          <GlassCard radius={24} style={{ padding: 36, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.mint[400]} />
            <Text className="text-white text-base font-bold mt-4">
              Crafting personalized recipes...
            </Text>
            <Text className="text-ink-300 text-xs text-center mt-1.5 leading-5">
              Gemini is checking your {freshProducts.length} fresh item(s) and prioritizing what expires first.
            </Text>
          </GlassCard>
        ) : recipes.length > 0 ? (
          /* Recipe Cards List */
          <View className="gap-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        ) : (
          /* Empty / First-Time Generate State */
          <View className="items-center justify-center py-10 px-4 gap-6">
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 80,
                width: 80,
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="sparkles" size={34} color="#04120E" />
            </LinearGradient>

            <View className="items-center gap-2">
              <Text className="text-white text-xl font-bold text-center">
                Cook With What You Have
              </Text>
              <Text className="text-ink-300 text-sm text-center leading-5">
                Generate tailored recipes from your {freshProducts.length} available kitchen item(s), complete with exact quantities and spice lists.
              </Text>
            </View>

            <Pressable
              onPress={handleGenerate}
              disabled={isGeneratingRecipes}
              style={{ width: '100%', opacity: isGeneratingRecipes ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 54,
                  borderRadius: 27,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="sparkles" size={18} color="#04120E" />
                <Text className="text-base font-bold" style={{ color: '#04120E' }}>
                  Generate Recipes
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}