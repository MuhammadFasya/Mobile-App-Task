import { Feather } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
};

const featureCards = [
  {
    title: "Dashboard",
    description: "Ringkasan singkat performa bisnis Anda.",
    icon: "bar-chart-2",
  },
  {
    title: "Calendar",
    description: "Atur jadwal meeting dan to-do secara terstruktur.",
    icon: "calendar",
  },
  {
    title: "Tasks",
    description: "Lacak progres tugas tim secara real-time.",
    icon: "check-circle",
  },
  {
    title: "Messages",
    description: "Komunikasi cepat antar anggota tim.",
    icon: "message-circle",
  },
];

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLargeTablet = width >= BREAKPOINTS.largeTablet;
  const isLandscape = width > height;

  // Decide number of columns based on breakpoint and orientation.
  let columns = 1;
  if (isLargeTablet) columns = 4;
  else if (isTablet) columns = 2;
  else if (isLandscape) columns = 2;

  // compute a responsive icon size based on width
  const iconSize = Math.max(20, Math.min(40, Math.round(width * 0.035)));

  // card width mapping
  const cardWidth = columns === 1 ? "100%" : columns === 2 ? "48%" : "23%";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          isTablet ? styles.containerTablet : styles.containerMobile,
        ]}
      >
        <View
          style={[
            styles.hero,
            isTablet ? styles.heroTablet : styles.heroMobile,
          ]}
        >
          <Text style={styles.overline}>
            {isTablet ? (isLargeTablet ? "Large Tablet" : "Tablet") : "Mobile"}{" "}
            View
          </Text>
          <View
            style={[
              styles.heroTextWrap,
              isTablet
                ? { alignItems: "center", flex: 1 }
                : { alignItems: "flex-start" },
            ]}
          >
            <Text style={styles.title}>Dashboard Responsive</Text>
            <Text style={styles.subtitle}>
              Contoh layout yang otomatis menyesuaikan tampilan tablet,
              large-tablet, ponsel, dan orientasi.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.cardGrid,
            columns > 1 ? styles.cardGridMulti : styles.cardGridMobile,
          ]}
        >
          {featureCards.map((card) => (
            <View key={card.title} style={[styles.card, { width: cardWidth }]}>
              <Feather
                name={card.icon as any}
                size={iconSize}
                color="#8AB4FF"
                accessibilityLabel={`${card.title} icon`}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  container: {
    flexGrow: 1,
    gap: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  containerMobile: {
    alignItems: "stretch",
  },
  containerTablet: {
    maxWidth: 1200,
    alignSelf: "center",
  },
  hero: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#111C33",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heroMobile: {
    alignItems: "flex-start",
  },
  heroTablet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  heroTextWrap: {
    maxWidth: 880,
  },
  overline: {
    color: "#8AB4FF",
    letterSpacing: 1,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#B8C6E3",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  cardGrid: {
    flexWrap: "wrap",
  },
  cardGridMobile: {
    flexDirection: "column",
    gap: 12,
  },
  cardGridMulti: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  card: {
    flexGrow: 1,
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#162544",
    marginBottom: 12,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardDesc: {
    color: "#B8C6E3",
    fontSize: 14,
    lineHeight: 20,
  },
});
