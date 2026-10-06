import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import CustomButton from "../components/customButton";
import TextField from "../components/TextField";
import { colors, spacing } from "../constants/colors";
import { registerUser } from "../services/authService";

export default function RegisterScreen({ onRegister, onCancel }) {
  const { width } = useWindowDimensions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert("Faltan campos", "Completa nombre, email y contraseña.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Las contraseñas no coinciden", "Revisa ambos campos e inténtalo nuevamente.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({ name, email, password });
      Alert.alert("Cuenta creada", "Tu cuenta fue creada. Ahora inicia sesión.");
      if (onRegister) onRegister();
    } catch (error) {
      Alert.alert("No se pudo crear la cuenta", error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const isWide = width >= 760;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.shell, isWide && styles.shellWide]}>
            <View style={styles.hero}>
              <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>E</Text></View><Text style={styles.brand}>ExpiryControl</Text></View>
              <Text style={styles.kicker}>Empieza con claridad</Text>
              <Text style={styles.title}>Un lugar más simple para cuidar tus productos.</Text>
              <Text style={styles.subtitle}>Crea tu cuenta y convierte las fechas de vencimiento en decisiones sencillas.</Text>
            </View>
            <View style={[styles.card, styles.cardShadow]}>
              <View style={styles.cardHeader}><Text style={styles.cardTitle}>Crear cuenta</Text><Text style={styles.cardSubtitle}>Solo necesitaremos unos datos.</Text></View>
              <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" autoCapitalize="words" />
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="nombre@ejemplo.com" />
              <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry />
              <TextField label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repite tu contraseña" secureTextEntry />
              <CustomButton title={loading ? "Creando cuenta..." : "Crear cuenta"} onPress={handleSubmit} disabled={loading} />
              <View style={styles.loginRow}><Text style={styles.loginPrompt}>¿Ya tienes una cuenta?</Text><Pressable onPress={onCancel}><Text style={styles.loginLink}>Volver al login</Text></Pressable></View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: spacing.page },
  shell: { alignSelf: "center", gap: 28, maxWidth: 980, width: "100%" },
  shellWide: { flexDirection: "row", gap: 34 },
  hero: { flex: 1, justifyContent: "center", paddingVertical: 18 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 46 },
  brandMark: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 11, height: 34, justifyContent: "center", width: 34 },
  brandMarkText: { color: colors.primaryInk, fontSize: 20, fontWeight: "900" },
  brand: { color: colors.text, fontSize: 16, fontWeight: "800", letterSpacing: 0.4 },
  kicker: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.2, marginBottom: 12, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 40, fontWeight: "800", lineHeight: 47, maxWidth: 480 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 16, maxWidth: 430 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 22, borderWidth: 1, gap: 18, justifyContent: "center", maxWidth: 410, padding: 24, width: "100%" },
  cardShadow: Platform.select({ web: { boxShadow: "0 14px 24px rgba(0, 0, 0, 0.28)" }, default: { elevation: 8, shadowColor: colors.shadow, shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { height: 14, width: 0 } } }),
  cardHeader: { marginBottom: 8 },
  cardTitle: { color: colors.text, fontSize: 23, fontWeight: "800", marginBottom: 6 },
  cardSubtitle: { color: colors.muted, fontSize: 13 },
  loginRow: { alignItems: "center", flexDirection: "row", gap: 5, justifyContent: "center", marginTop: 2 },
  loginPrompt: { color: colors.muted, fontSize: 13 },
  loginLink: { color: colors.primary, fontSize: 13, fontWeight: "800" },
});
