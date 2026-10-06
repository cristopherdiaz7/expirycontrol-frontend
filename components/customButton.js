import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

export default function CustomButton({ title, onPress, disabled = false, variant = "primary" }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
    		styles[variant],
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.title, styles[`${variant}Title`]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
	primary: { backgroundColor: colors.primary },
	secondary: { backgroundColor: colors.cardElevated, borderColor: colors.border, borderWidth: 1 },
  buttonDisabled: {
    backgroundColor: colors.muted,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryTitle: { color: colors.primaryInk },
  secondaryTitle: { color: colors.text },
});