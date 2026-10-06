import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

export default function StatCard({ label, value, tone = "default" }) {
  return (
    <View style={[styles.card, styles[tone]]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, flex: 1, minWidth: 130, padding: 14 },
  default: { backgroundColor: colors.cardElevated, borderColor: colors.border },
  warning: { backgroundColor: "#3B2D16", borderColor: "#8A6A2F" },
  danger: { backgroundColor: "#3A2025", borderColor: "#7E3B45" },
  success: { backgroundColor: "#153522", borderColor: "#2D7443" },
  value: { color: colors.text, fontSize: 26, fontWeight: "800", marginBottom: 4 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700" },
});
