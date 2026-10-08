import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

// Mensaje de error dentro de un formulario (por ejemplo, la respuesta del servidor).
export default function FormMessage({ message }) {
  if (!message) return null;

  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.dangerSoft, borderColor: "#80434A", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  text: { color: colors.danger, fontSize: 13, lineHeight: 19 },
});
