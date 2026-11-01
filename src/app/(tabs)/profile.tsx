import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { user as mockUser } from '@/data/mockData';
import { colors, gradients } from '@/theme/colors';

// 1. Import the auth context
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  // 2. Extract user data and the logout action
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [darkGlass, setDarkGlass] = useState(true);

  // Use the logged-in user's data, fallback to mock data if loading
  const displayName = user?.name || mockUser.name;
  const displayEmail = user?.email || mockUser.email;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2) // Ensure max 2 characters
    .toUpperCase();

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
        <Text className="text-white text-2xl font-bold">Profile</Text>

        <GlassCard radius={26}>
          <View className="px-5 py-6 items-center gap-3">
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 72, width: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="text-xl font-bold" style={{ color: '#F5FAF7' }}>
                {initials}
              </Text>
            </LinearGradient>
            <View className="items-center gap-0.5">
              <Text className="text-white text-lg font-bold">{displayName}</Text>
              <Text className="text-ink-300 text-sm">{displayEmail}</Text>
            </View>

            <View className="flex-row gap-6 mt-2">
              <View className="items-center">
                {/* Changed mockUser to user? */}
                <Text className="text-white text-base font-bold">{user?.householdSize || 1}</Text>
                <Text className="text-ink-300 text-xs mt-0.5">Household</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <View className="items-center">
                {/* Changed mockUser to user? */}
                <Text className="text-white text-base font-bold">{user?.memberSince || 'Just now'}</Text>
                <Text className="text-ink-300 text-xs mt-0.5">Member since</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <View className="gap-2">
          <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Preferences</Text>
          <GlassCard radius={22}>
            <ProfileMenuItem
              icon="notifications"
              label="Expiry Notifications"
              tint={colors.mint[400]}
              right="switch"
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
            <ProfileMenuItem
              icon="water"
              label="Liquid Glass Theme"
              tint={colors.mint[300]}
              right="switch"
              switchValue={darkGlass}
              onSwitchChange={setDarkGlass}
              isLast
            />
          </GlassCard>
        </View>

        <View className="gap-2">
          <Text className="text-ink-300 text-xs font-semibold uppercase ml-1">Account</Text>
          <GlassCard radius={22}>
            <ProfileMenuItem icon="people" label="Household Members" />
            <ProfileMenuItem icon="pricetags" label="Manage Categories" />
            <ProfileMenuItem icon="help-circle" label="Help & Support" isLast />
          </GlassCard>
        </View>

        <GlassCard radius={22}>
          {/* 3. Added onPress={logout} to trigger the auth state change */}
          <ProfileMenuItem
            icon="log-out"
            label="Log Out"
            danger
            right="chevron"
            isLast
            onPress={logout}
          />
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}