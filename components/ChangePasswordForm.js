import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import FormMessage from "./FormMessage";
import TextField from "./TextField";
import { colors, fonts, glass, radius, shadows, spacing, type } from "../constants/theme";
import { isSessionExpired } from "../services/api";
import { changePassword } from "../services/authService";
import useBreakpoint from "../utils/useBreakpoint";

export const MIN_PASSWORD_LENGTH = 6;

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

// Mismas reglas que el registro; la contraseña actual la verifica el backend.
export function validatePasswordChange(form) {
  const errors = {};

  if (!form.currentPassword) errors.currentPassword = "Ingresa tu contraseña actual.";

  if (!form.newPassword) errors.newPassword = "Ingresa la nueva contraseña.";
  else if (form.newPassword.length < MIN_PASSWORD_LENGTH) errors.newPassword = `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  else if (form.newPassword === form.currentPassword) errors.newPassword = "Debe ser distinta de la actual.";

  if (!form.confirmPassword) errors.confirmPassword = "Repite la nueva contraseña.";
  else if (form.newPassword !== form.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";

  return errors;
}

export default function ChangePasswordForm({ token, onSaved, onCancel, onUnauthorized }) {
  const { isTablet } = useBreakpoint();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validatePasswordChange(form);
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await changePassword(token, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      onSaved();
    } catch (error) {
      if (isSessionExpired(error)) {
        onUnauthorized();
        return;
      }
      setFormError(error.message);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onCancel} disabled={loading} accessibilityRole="button" style={styles.back}>
        <Feather name="arrow-left" size={16} color={colors.softText} />
        <Text style={styles.backText}>Volver</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.kicker}>Tu cuenta</Text>
        <Text style={styles.title}>Cambiar contraseña</Text>
        <Text style={styles.subtitle}>Por seguridad, primero confirma tu contraseña actual.</Text>
      </View>

      <View style={styles.card}>
        <FormMessage message={formError} />
        <TextField label="Contraseña actual" icon="lock" value={form.currentPassword} onChangeText={(value) => updateField("currentPassword", value)} placeholder="Tu contraseña actual" secureTextEntry error={errors.currentPassword} />
        <TextField label="Nueva contraseña" icon="key" value={form.newPassword} onChangeText={(value) => updateField("newPassword", value)} placeholder="Mínimo 6 caracteres" secureTextEntry error={errors.newPassword} />
        <TextField label="Confirmar nueva contraseña" icon="key" value={form.confirmPassword} onChangeText={(value) => updateField("confirmPassword", value)} placeholder="Repite la nueva contraseña" secureTextEntry error={errors.confirmPassword} />
        <View style={[styles.actions, isTablet && styles.actionsWide]}>
          <CustomButton title="Cancelar" onPress={onCancel} disabled={loading} variant="secondary" style={isTablet && styles.actionWide} />
          <CustomButton title={loading ? "Guardando..." : "Guardar contraseña"} icon={loading ? undefined : "check"} onPress={handleSubmit} disabled={loading} style={isTablet && styles.actionWide} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 720, padding: spacing.page, paddingBottom: 48, paddingTop: 28, width: "100%" },
  back: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 8, marginBottom: 22, paddingVertical: 6 },
  backText: { color: colors.softText, fontFamily: fonts.semibold, fontSize: 13.5 },
  header: { marginBottom: 22 },
  kicker: { ...type.kicker, marginBottom: 10 },
  title: { ...type.title, marginBottom: 8 },
  subtitle: { ...type.body },
  card: { ...glass.surface, ...shadows.card, borderRadius: radius.xl, gap: 17, padding: 22 },
  actions: { flexDirection: "column-reverse", gap: 10, marginTop: 6 },
  actionsWide: { flexDirection: "row", justifyContent: "flex-end" },
  actionWide: { minWidth: 170 },
});
