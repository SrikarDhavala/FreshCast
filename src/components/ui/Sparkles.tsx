import { useEffect, useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

const { width, height } = Dimensions.get('window');

type StarConfig = {
  id: number;
  top: number;
  left: number;
  size: number;
  initialDelay: number;
  flashDuration: number;
  pauseDuration: number;
};

function generateStars(count: number): StarConfig[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: Math.random() * height,
    left: Math.random() * width,
    size: 1.5 + Math.random() * 2.5,
    initialDelay: Math.random() * 4000,
    flashDuration: 280 + Math.random() * 260,
    pauseDuration: 1800 + Math.random() * 3400,
  }));
}

function Star({ top, left, size, initialDelay, flashDuration, pauseDuration }: StarConfig) {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withDelay(
      initialDelay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: flashDuration }),
          withTiming(0.12, { duration: flashDuration * 1.4 }),
          withTiming(0.12, { duration: pauseDuration }),
        ),
        -1,
      ),
    );
  }, [opacity, initialDelay, flashDuration, pauseDuration]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.mint[300],
        },
        animatedStyle,
      ]}
    />
  );
}

export function Sparkles({ count = 26 }: { count?: number }) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
    </View>
  );
}
