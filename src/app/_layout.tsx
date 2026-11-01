import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BlurTargetProvider } from '@/context/blurTarget';
import { InventoryProvider } from '@/store/inventory';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import '@/styles/global.css';

function RootLayoutNav() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments.length) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments]);

  return (
    <InventoryProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-item" options={{ presentation: 'transparentModal' }} />
      </Stack>
    </InventoryProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <BlurTargetProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </BlurTargetProvider>
    </SafeAreaProvider>
  );
}