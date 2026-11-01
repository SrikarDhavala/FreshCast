import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '@/theme/colors';

type GlassCardProps = ViewProps & {
  intensity?: number;
  radius?: number;
  bordered?: boolean;
};

export function GlassCard({
  children,
  style,
  intensity = 40,
  radius = 24,
  bordered = true,
  ...rest
}: GlassCardProps) {
  return (
    <View
      style={[{ borderRadius: radius, overflow: 'hidden' }, style]}
      {...rest}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.glass.fill,
            borderRadius: radius,
            borderWidth: bordered ? 1 : 0,
            borderColor: colors.glass.border,
          },
        ]}
      />
      <View style={{ borderRadius: radius, flexShrink: 1 }}>{children}</View>
    </View>
  );
}
