import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AuthLayout from "../components/AuthLayout";
import CustomButton from "../components/customButton";
import FormMessage from "../components/FormMessage";
import TextField from "../components/TextField";
import { colors, fonts } from "../constants/theme";
import { loginUser } from "../services/authService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const benefits = [
  { icon: "package", text: "Inventario en un solo lugar" },
  { icon: "bell", text: "Alertas antes del vencimiento" },
  { icon: "check-circle", text: "Decisiones rápidas y claras" },
];

export default function LoginScreen({ onLogin, onNavigateToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const changeEmail = (value) => { setEmail(value); setErrors((current) => ({ ...current, email: undefined })); };
  const changePassword = (value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); };

  const handleLogin = async () => {
    const validationErrors = {};
    if (!email.trim()) validationErrors.email = "Ingresa tu email.";
    else if (!EMAIL_PATTERN.test(email.trim())) validationErrors.email = "Ingresa un email válido.";
    if (!password) validationErrors.password = "Ingresa tu contraseña.";

    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const result = await loginUser({ email: email.trim(), password });
      if (onLogin) await onLogin(result);
    } catch (error) {
      setFormError(error.message || "No se pudo iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      kicker="Tu inventario, bajo control"
      title="Que nada importante llegue tarde."
      subtitle="Organiza tus productos y detecta a tiempo lo que necesita atención."
      benefits={benefits}
      cardTitle="Bienvenido de nuevo"
      cardSubtitle="Ingresa para ver tu resumen."
    >
      <FormMessage message={formError} />
      <TextField label="Email" icon="mail" value={email} onChangeText={changeEmail} placeholder="nombre@ejemplo.com" keyboardType="email-address" error={errors.email} />
      <TextField label="Contraseña" icon="lock" value={password} onChangeText={changePassword} placeholder="Escribe tu contraseña" secureTextEntry error={errors.password} />
      <CustomButton title={loading ? "Ingresando..." : "Ingresar"} icon={loading ? undefined : "log-in"} onPress={handleLogin} disabled={loading} />
      <View style={styles.switchRow}>
        <Text style={styles.switchPrompt}>¿Todavía no tienes cuenta?</Text>
        <Pressable onPress={onNavigateToRegister} accessibilityRole="link"><Text style={styles.switchLink}>Registrate</Text></Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  switchRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 2 },
  switchPrompt: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  switchLink: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
});
