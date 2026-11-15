import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View, Keyboard, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpiryItemCard } from '@/components/home/ExpiryItemCard';
import { StatPill } from '@/components/home/StatPill';
import { Fab } from '@/components/ui/Fab';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useInventory } from '@/store/inventory';
import { colors } from '@/theme/colors';
import { expiryStatus } from '@/utils/date';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { products } = useInventory();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnread, setHasUnread] = useState(false);

  const expiringSoon = products
    .filter((p) => ['urgent', 'soon'].includes(expiryStatus(p.expiryDate)))
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const expiredCount = products.filter((p) => expiryStatus(p.expiryDate) === 'expired').length;
  const recentlyAdded = [...products]
    .sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''))
    .slice(0, 4);

  const alertCount = expiringSoon.length + expiredCount;

  useEffect(() => {
    if (alertCount > 0) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
  }, [alertCount]);

  const handleOpenNotifications = () => {
    setHasUnread(false);
    router.push('/notifications');
  };

  const searchResults = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <View className="flex-row items-start justify-between">
          <View className="gap-1.5 flex-1 pr-4">
            <Text className="text-mint-400 text-[13px] font-semibold">{greeting} 👋</Text>
            <Text className="text-white text-[26px] font-extrabold leading-8">
              Hey, <Text style={{ color: colors.mint[400] }}>{firstName}</Text>
            </Text>
            <Text className="text-ink-300 text-[13px]">Here&apos;s what&apos;s fresh in your kitchen.</Text>
          </View>

          {/* Notifications Button */}
          <Pressable onPress={handleOpenNotifications}>
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }}>
                <GlassCard
                  radius={23}
                  style={{
                    height: 46,
                    width: 46,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: hasUnread ? 'rgba(43,255,156,0.4)' : colors.glass.borderStrong,
                    borderWidth: 1,
                  }}
                >
                  <Ionicons
                    name={hasUnread ? 'notifications' : 'notifications-outline'}
                    size={21}
                    color={hasUnread ? colors.mint[300] : colors.text.primary}
                  />
                </GlassCard>

                {hasUnread && alertCount > 0 && (
                  <View
                    style={{
                      backgroundColor: expiredCount > 0 ? colors.status.expired : colors.status.soon,
                      borderColor: '#04120E',
                      borderWidth: 2,
                    }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full items-center justify-center"
                  >
                    <Text className="text-[10px] font-extrabold" style={{ color: '#04120E' }}>
                      {alertCount > 9 ? '9+' : alertCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search items..."
        />

        {searchQuery.trim().length > 0 ? (
          <View className="gap-3">
            <Text className="text-ink-300 text-sm mb-2 font-medium">Search Results</Text>
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <ExpiryItemCard key={product.id} product={product} />
              ))
            ) : (
              <View className="items-center py-10">
                <Ionicons name="search-outline" size={32} color={colors.text.tertiary} />
                <Text className="text-ink-300 text-sm mt-3">No items found matching "{searchQuery}"</Text>
              </View>
            )}
          </View>
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
      <Fab onPress={() => router.push('/add-item')} />
    </ScreenBackground>
  );
}