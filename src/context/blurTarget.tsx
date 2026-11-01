import { createContext, useContext, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { View } from 'react-native';

type BlurTargetContextValue = {
  view: View | null;
  setView: (view: View | null) => void;
};

const BlurTargetContext = createContext<BlurTargetContextValue | null>(null);

export function BlurTargetProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View | null>(null);
  const value = useMemo(() => ({ view, setView }), [view]);
  return <BlurTargetContext.Provider value={value}>{children}</BlurTargetContext.Provider>;
}

function useBlurTargetContext(): BlurTargetContextValue {
  const ctx = useContext(BlurTargetContext);
  if (!ctx) {
    throw new Error('useBlurTargetContext must be used within a BlurTargetProvider');
  }
  return ctx;
}

/** Call when a screen's blurrable content mounts/focuses so the navbar knows what to blur. */
export function useSetBlurTarget(): (view: View | null) => void {
  return useBlurTargetContext().setView;
}

/**
 * A fresh ref-like object whose `.current` reflects the currently focused screen's blur target.
 * `BlurView` only re-reads `blurTarget` when the prop object changes, so this must be a new
 * object each time the target changes rather than a ref mutated in place.
 */
export function useBlurTargetRef(): RefObject<View | null> {
  const { view } = useBlurTargetContext();
  return useMemo(() => ({ current: view }), [view]);
}
