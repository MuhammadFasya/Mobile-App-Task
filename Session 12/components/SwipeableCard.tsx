import React from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const SWIPE_LIMIT = width * 0.25;

const SwipeableCard = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > SWIPE_LIMIT) {
        const to = translateX.value > 0 ? width : -width;

        translateX.value = withSequence(
          withSpring(to),
          withDelay(500, withSpring(0))
        );

        translateY.value = withDelay(500, withSpring(0));
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, 0, width],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text style={styles.text}>SWIPE ME</Text>
      </Animated.View>
    </GestureDetector>
  );
};

export default SwipeableCard;

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: 250,
    backgroundColor: "#6366F1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 120,
  },
  text: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
});
