import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpiryItemCard } from '@/components/home/ExpiryItemCard';
import { StatPill } from '@/components/home/StatPill';
import { Fab } from '@/components/ui/Fab';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { user } from '@/data/mockData';
import { useInventory } from '@/store/inventory';
import { colors, gradients } from '@/theme/colors';
import { expiryStatus } from '@/utils/date';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { products } = useInventory();
  const { user } = useAuth();

  const expiringSoon = products
    .filter((p) => ['urgent', 'soon'].includes(expiryStatus(p.expiryDate)))
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const expiredCount = products.filter((p) => expiryStatus(p.expiryDate) === 'expired').length;
  const recentlyAdded = [...products]
    .sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''))
    .slice(0, 4);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Chef';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 140,
          paddingHorizontal: 20,
          gap: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <View className="gap-1.5 flex-1 pr-4">
            <Text className="text-mint-400 text-[13px] font-semibold">{greeting} 👋</Text>
            <Text className="text-white text-[26px] font-extrabold leading-8">
              Hey, <Text style={{ color: colors.mint[400] }}>{firstName}</Text>
            </Text>
            <Text className="text-ink-300 text-[13px]">Here&apos;s what&apos;s fresh in your kitchen.</Text>
          </View>
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 46, width: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text className="text-base font-bold" style={{ color: '#F5FAF7' }}>
              {firstName[0]}
            </Text>
          </LinearGradient>
        </View>

        <SearchBar />

        <View className="flex-row gap-3">
          <StatPill label="Total Items" value={products.length} icon="cube" tint={colors.mint[300]} />
          <StatPill label="Expiring Soon" value={expiringSoon.length} icon="alert-circle" tint={colors.status.soon} />
          <StatPill label="Expired" value={expiredCount} icon="close-circle" tint={colors.status.expired} />
        </View>

        <View>
          <SectionHeader title="Expiring Soon" actionLabel="See all" />
          <View className="gap-3">
            {expiringSoon.map((product) => (
              <ExpiryItemCard key={product.id} product={product} />
            ))}
            {expiringSoon.length === 0 && (
              <View className="items-center py-6">
                <Ionicons name="checkmark-circle" size={28} color={colors.mint[400]} />
                <Text className="text-ink-300 text-sm mt-2">Nothing expiring soon</Text>
              </View>
            )}
          </View>
        </View>

        <View>
          <SectionHeader title="Recently Added" actionLabel="See all" />
          <View className="gap-3">
            {recentlyAdded.map((product) => (
              <ExpiryItemCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
      <Fab onPress={() => router.push('/add-item')} />
    </ScreenBackground>
  );
}
