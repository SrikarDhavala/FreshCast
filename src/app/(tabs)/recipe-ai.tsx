import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors, gradients } from '@/theme/colors';

export default function RecipeAiScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <View
        style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 140 }}
        className="flex-1 items-center justify-center px-8 gap-6"
      >
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 84,
            width: 84,
            borderRadius: 42,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#0DED84',
            shadowOpacity: 0.45,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 10 },
          }}
        >
          <Ionicons name="sparkles" size={36} color="#F5FAF7" />
        </LinearGradient>

        <View className="items-center gap-2">
          <Text className="text-white text-2xl font-bold">RecipeAI</Text>
          <Text className="text-ink-300 text-[15px] text-center leading-5">
            Smart recipes from what&apos;s already in your kitchen — before it expires.
          </Text>
        </View>

        <GlassCard radius={20} style={{ width: '100%' }}>
          <View className="px-5 py-4 flex-row items-center gap-3">
            <View
              style={{ backgroundColor: `${colors.mint[300]}22` }}
              className="h-9 w-9 rounded-full items-center justify-center"
            >
              <Ionicons name="hammer" size={16} color={colors.mint[300]} />
            </View>
            <Text className="flex-1 text-ink-200 text-sm">
              This feature is cooking. Check back once your inventory is connected.
            </Text>
          </View>
        </GlassCard>

        <View
          style={{ backgroundColor: 'rgba(43,255,156,0.14)', borderColor: 'rgba(43,255,156,0.3)' }}
          className="px-4 py-1.5 rounded-full border"
        >
          <Text className="text-mint-300 text-xs font-semibold">Coming soon</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}
