import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;
const SWIPE_THRESHOLD = width * 0.2;

interface Card {
  id: string;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
  location: string;
}

const INITIAL_CARDS: Card[] = [
  {
    id: "1",
    name: "Sarah",
    age: 26,
    bio: "Coffee lover & adventurer ☕✈️",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    location: "New York, NY",
  },
  {
    id: "2",
    name: "Emma",
    age: 24,
    bio: "Artist & book enthusiast 🎨📚",
    imageUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop",
    location: "Los Angeles, CA",
  },
  {
    id: "3",
    name: "Jessica",
    age: 27,
    bio: "Fitness enthusiast & traveler 💪🌍",
    imageUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop",
    location: "Miami, FL",
  },
  {
    id: "4",
    name: "Anna",
    age: 25,
    bio: "Music producer & foodie 🎵🍕",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
    location: "Chicago, IL",
  },
  {
    id: "5",
    name: "Sophia",
    age: 23,
    bio: "Yoga instructor & nature lover 🧘‍♀️🌿",
    imageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    location: "Austin, TX",
  },
];

interface CardProps {
  card: Card;
  index: number;
  onSwipe: (direction: "left" | "right") => void;
  isActive: boolean;
}

const TinderCard: React.FC<CardProps> = ({
  card,
  index,
  onSwipe,
  isActive,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1 - index * 0.05);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (index === 0) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.3;
      }
    })
    .onEnd((event) => {
      if (index !== 0) return;

      const velocity = event.velocityX;
      const distance = event.translationX;

      // Determine swipe direction
      if (distance > SWIPE_THRESHOLD || velocity > 800) {
        // Swipe right - like
        translateX.value = withSpring(width + 100, {
          damping: 10,
          mass: 1,
          overshootClamping: false,
        });
        translateY.value = withSpring(height);
        runOnJS(onSwipe)("right");
      } else if (distance < -SWIPE_THRESHOLD || velocity < -800) {
        // Swipe left - dislike
        translateX.value = withSpring(-width - 100, {
          damping: 10,
          mass: 1,
          overshootClamping: false,
        });
        translateY.value = withSpring(height);
        runOnJS(onSwipe)("left");
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, 0, width],
      [-20, 0, 20]
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.5]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + index * 10 },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity,
      zIndex: 1000 - index,
    };
  });

  // Overlay indicators
  const overlayLeftStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1]
    );
    return { opacity };
  });

  const overlayRightStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.cardContainer, animatedStyle]}
        pointerEvents={index === 0 ? "auto" : "none"}
      >
        <View style={styles.card}>
          {/* Card Image */}
          <ImageBackground
            source={{ uri: card.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
              style={styles.gradient}
            >
              {/* Card Content */}
              <View style={styles.contentContainer}>
                <View>
                  <Text style={styles.name}>
                    {card.name}, {card.age}
                  </Text>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="#FFF" />
                    <Text style={styles.location}>{card.location}</Text>
                  </View>
                  <Text style={styles.bio}>{card.bio}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Swipe Indicators */}
            <Animated.View style={[styles.overlayLeft, overlayLeftStyle]}>
              <View style={[styles.overlayBadge, { borderColor: "#FF6B6B" }]}>
                <Text style={styles.overlayText}>NOPE</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.overlayRight, overlayRightStyle]}>
              <View style={[styles.overlayBadge, { borderColor: "#4ECDC4" }]}>
                <Text style={styles.overlayTextLike}>LIKE</Text>
              </View>
            </Animated.View>
          </ImageBackground>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const Settings = () => {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    // Remove the top card
    setCards((prev) => prev.slice(1));
  }, []);

  return (
    <View style={styles.container}>
      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {cards.length > 0 ? (
          cards
            .slice(0, 3)
            .reverse()
            .map((card, reversedIndex) => {
              const index = cards.slice(0, 3).length - 1 - reversedIndex;
              return (
                <TinderCard
                  key={card.id}
                  card={card}
                  index={index}
                  onSwipe={handleSwipe}
                  isActive={index === 0}
                />
              );
            })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No more profiles!</Text>
            <Text style={styles.emptySubtitle}>
              You&apos;ve reviewed all profiles
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cardContainer: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    zIndex: 1000,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    color: "#FFF",
    lineHeight: 22,
  },
  overlayLeft: {
    position: "absolute",
    top: 50,
    left: 30,
    alignItems: "center",
    transform: [{ rotate: "-30deg" }],
  },
  overlayRight: {
    position: "absolute",
    top: 50,
    right: 30,
    alignItems: "center",
    transform: [{ rotate: "30deg" }],
  },
  overlayBadge: {
    borderWidth: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overlayText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF6B6B",
    letterSpacing: 2,
  },
  overlayTextLike: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4ECDC4",
    letterSpacing: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
  },
});
