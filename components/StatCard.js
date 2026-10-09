import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, glass, radius, tones, type } from "../constants/theme";

export default function StatCard({ label, value, tone = "default", icon = "box", style, valueSize }) {
  const palette = tones[tone];

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.icon, { backgroundColor: palette.bg }]}>
        <Feather name={icon} size={17} color={palette.fg} />
      </View>
      <Text style={[styles.value, valueSize && { fontSize: valueSize, lineHeight: valueSize + 6 }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...glass.surface, borderRadius: radius.lg, padding: 16 },
  icon: { alignItems: "center", borderRadius: radius.md, height: 36, justifyContent: "center", marginBottom: 16, width: 36 },
  value: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 30, letterSpacing: -0.6, lineHeight: 34 },
  label: { ...type.small, color: colors.softText, fontFamily: fonts.medium, marginTop: 4 },
});
