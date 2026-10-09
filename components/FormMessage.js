import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../constants/theme";

// Mensaje de error dentro de un formulario (por ejemplo, la respuesta del servidor).
export default function FormMessage({ message }) {
  if (!message) return null;

  return (
    <View style={styles.box} accessibilityRole="alert">
      <Feather name="alert-circle" size={16} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  text: { color: colors.danger, flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
});
