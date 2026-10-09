import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, glass, radius, tones, type } from "../constants/theme";

// Recuadro para los estados de carga, vacío y error de una sección.
export default function StateBox({ icon, tone = "default", title, text, loading = false, action, style }) {
  const palette = tones[tone];

  return (
    <View style={[styles.box, style]}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && icon ? (
        <View style={[styles.icon, { backgroundColor: palette.bg }]}>
          <Feather name={icon} size={22} color={palette.fg} />
        </View>
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { ...glass.surface, alignItems: "center", borderRadius: radius.xl, paddingHorizontal: 24, paddingVertical: 36 },
  icon: { alignItems: "center", borderRadius: radius.lg, height: 52, justifyContent: "center", marginBottom: 14, width: 52 },
  title: { ...type.heading, fontSize: 17, marginBottom: 6, textAlign: "center" },
  text: { ...type.body, fontSize: 13.5, marginTop: 4, maxWidth: 360, textAlign: "center" },
  action: { marginTop: 18 },
});
