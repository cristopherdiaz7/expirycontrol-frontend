import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

export default function StatCard({ label, value, tone = "default" }) {
  return (
    <View style={[styles.card, styles[tone]]}>
    <View style={[styles.accent, styles[`${tone}Accent`]]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, flex: 1, minWidth: 130, overflow: "hidden", padding: 15 },
  default: { backgroundColor: colors.cardElevated, borderColor: colors.border },
  warning: { backgroundColor: colors.warningSoft, borderColor: "#806632" },
  danger: { backgroundColor: colors.dangerSoft, borderColor: "#80434A" },
  success: { backgroundColor: colors.successSoft, borderColor: "#397556" },
  accent: { backgroundColor: colors.primary, borderRadius: 4, height: 4, marginBottom: 16, width: 28 },
  defaultAccent: { backgroundColor: colors.primary },
  warningAccent: { backgroundColor: colors.warning },
  dangerAccent: { backgroundColor: colors.danger },
  successAccent: { backgroundColor: colors.success },
  value: { color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 4 },
  label: { color: colors.softText, fontSize: 12, fontWeight: "700" },
});
