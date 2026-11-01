import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type SceneInterpolatorProps = {
  current: { progress: Animated.AnimatedInterpolation<number> };
};

export const slideSceneStyleInterpolator = ({ current }: SceneInterpolatorProps) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-width * 0.28, 0, width * 0.28],
        }),
      },
      {
        scale: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.96, 1, 0.96],
        }),
      },
    ],
  },
});
