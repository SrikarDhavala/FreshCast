import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef } from 'react';
import { StyleSheet, type View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Sparkles } from '@/components/ui/Sparkles';
import { useSetBlurTarget } from '@/context/blurTarget';
import { gradients } from '@/theme/colors';

export function ScreenBackground({ children }: { children: React.ReactNode }) {
  const localRef = useRef<View>(null);
  const setBlurTarget = useSetBlurTarget();

  useFocusEffect(
    useCallback(() => {
      setBlurTarget(localRef.current);
      return () => setBlurTarget(null);
    }, [setBlurTarget]),
  );

  return (
    <BlurTargetView ref={localRef} style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={gradients.screen}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Sparkles />
      {children}
    </BlurTargetView>
  );
}
