import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../constants/theme";

// Enlace al pie de Login y Registro para pasar de una pantalla a la otra.
export default function AuthSwitch({ prompt, linkText, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt}</Text>
      <Pressable onPress={onPress} accessibilityRole="link"><Text style={styles.link}>{linkText}</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 2 },
  prompt: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  link: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
});
