import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients } from '@/theme/colors';

export function Fab({ onPress }: { onPress?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        right: 20,
        bottom: insets.bottom + 92,
        shadowColor: '#0DED84',
        shadowOpacity: 0.5,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={gradients.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 56,
            width: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          }}
        >
          <Ionicons name="add" size={28} color="#F5FAF7" />
        </LinearGradient>
      )}
    </Pressable>
  );
}
