import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, type } from "../constants/theme";

const inkByVariant = {
  primary: colors.primaryInk,
  secondary: colors.text,
  danger: colors.danger,
  ghost: colors.softText,
};

export default function CustomButton({ title, onPress, disabled = false, variant = "primary", icon, size = "md", style }) {
  const ink = disabled && variant === "primary" ? colors.background : inkByVariant[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed, hovered }) => [
        styles.button,
        styles[size],
        styles[variant],
        hovered && !disabled && styles.hovered,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={size === "sm" ? 14 : 16} color={ink} /> : null}
      <Text style={[styles.title, size === "sm" && styles.titleSm, { color: ink }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center" },
  md: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 12 },
  sm: { minHeight: 38, paddingHorizontal: 13, paddingVertical: 8 },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: colors.glassBorder },
  danger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder },
  ghost: { backgroundColor: "transparent", borderColor: "transparent" },
  hovered: { opacity: 0.92 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.55 },
  title: { ...type.button },
  titleSm: { fontSize: 12.5 },
});
