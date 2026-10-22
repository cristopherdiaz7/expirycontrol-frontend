import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, type } from "../constants/theme";

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  helper,
  error,
  icon,
}) {
  const [focused, setFocused] = useState(false);
  // En los campos de contraseña, el ojo permite ver u ocultar lo que se escribió.
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hideText = secureTextEntry && !passwordVisible;
  const iconColor = error ? colors.danger : focused ? colors.primary : colors.muted;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, error && styles.inputWrapError]}>
        {icon ? <Feather name={icon} size={16} color={iconColor} style={styles.icon} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hideText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            hitSlop={8}
            style={styles.toggle}
          >
            <Feather name={passwordVisible ? "eye-off" : "eye"} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      {helper && !error ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { ...type.label, color: colors.softText },
  inputWrap: { alignItems: "center", backgroundColor: colors.inputBackground, borderColor: colors.glassBorder, borderRadius: radius.md, borderWidth: 1, flexDirection: "row" },
  inputWrapFocused: { borderColor: colors.primary },
  inputWrapError: { borderColor: colors.danger },
  icon: { marginLeft: 14 },
  toggle: { paddingHorizontal: 14, paddingVertical: 10 },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 13,
    ...Platform.select({ web: { outlineStyle: "none" }, default: {} }),
  },
  errorRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  error: { color: colors.danger, flex: 1, fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17 },
  helper: { ...type.small },
});
