import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  categories: { active: 'grid', inactive: 'grid-outline' },
  'recipe-ai': { active: 'sparkles', inactive: 'sparkles-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

const BAR_PADDING = 6;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = state.routes.length > 0 ? (barWidth - BAR_PADDING * 2) / state.routes.length : 0;

  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = withSpring(state.index * tabWidth, {
        damping: 16,
        stiffness: 180,
        mass: 0.6,
      });
    }
  }, [state.index, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 10, alignItems: 'center' }}
    >
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={{
          borderRadius: 32,
          overflow: 'hidden',
          maxWidth: 340,
          width: '86%',
        }}
      >
        <BlurView
          intensity={55}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <View
          style={{
            backgroundColor: 'rgba(4,6,3,0.62)',
            borderWidth: 1,
            borderColor: colors.glass.borderStrong,
            borderRadius: 32,
            flexDirection: 'row',
            padding: BAR_PADDING,
          }}
        >
          {tabWidth > 0 && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: BAR_PADDING,
                  bottom: BAR_PADDING,
                  left: BAR_PADDING,
                  borderRadius: 26,
                  backgroundColor: colors.glass.fillStrong,
                  borderWidth: 1,
                  borderColor: 'rgba(43,255,156,0.35)',
                },
                indicatorStyle,
              ]}
            />
          )}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;

            const onPress = () => {
              // Safely emit the tabPress event for animations/listeners
              const event = navigation?.emit ? navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              }) : null;

              if (!isFocused && !event?.defaultPrevented) {
                // Map "index" to the root tabs path, and others to their specific tab path
                const targetPath = route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}`;
                
                // Use Expo's router directly with the absolute path
                router.navigate(targetPath as any);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options?.tabBarAccessibilityLabel}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 11,
                }}
              >
                <TabIcon focused={isFocused} name={isFocused ? icons.active : icons.inactive} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabIcon({ focused, name }: { focused: boolean; name: keyof typeof Ionicons.glyphMap }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.08 : 1, { duration: 180 });
  }, [focused, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={22} color={focused ? colors.mint[300] : colors.text.tertiary} />
    </Animated.View>
  );
}