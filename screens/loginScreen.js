import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import CustomButton from "../components/customButton";
import TextField from "../components/TextField";
import { colors, spacing } from "../constants/colors";
import { loginUser } from "../services/authService";

const benefits = ["Inventario en un solo lugar", "Alertas antes del vencimiento", "Decisiones rápidas y claras"];

export default function LoginScreen({ onLogin, onNavigateToRegister }) {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Faltan campos", "Completa email y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser({ email, password });
      if (onLogin) await onLogin(result);
    } catch (error) {
      Alert.alert("No se pudo iniciar sesión", error.message || String(error));
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
              <View style={styles.brandRow}>
                <View style={styles.brandMark}><Text style={styles.brandMarkText}>E</Text></View>
                <Text style={styles.brand}>ExpiryControl</Text>
              </View>
              <Text style={styles.kicker}>Tu inventario, bajo control</Text>
              <Text style={styles.title}>Que nada importante llegue tarde.</Text>
              <Text style={styles.subtitle}>Organiza tus productos y detecta a tiempo lo que necesita atención.</Text>
              <View style={styles.benefits}>
                {benefits.map((benefit) => <View key={benefit} style={styles.benefit}><Text style={styles.benefitMark}>+</Text><Text style={styles.benefitText}>{benefit}</Text></View>)}
              </View>
            </View>

            <View style={[styles.card, styles.cardShadow]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Bienvenido de nuevo</Text>
                <Text style={styles.cardSubtitle}>Ingresa para ver tu resumen.</Text>
              </View>
              <TextField label="Email" value={email} onChangeText={setEmail} placeholder="nombre@ejemplo.com" />
              <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="Escribe tu contraseña" secureTextEntry />
              <CustomButton title={loading ? "Ingresando..." : "Ingresar"} onPress={handleLogin} disabled={loading} />
              <View style={styles.registerRow}>
                <Text style={styles.registerPrompt}>¿Todavía no tienes cuenta?</Text>
                <Pressable onPress={onNavigateToRegister}><Text style={styles.registerLink}>Registrate</Text></Pressable>
              </View>
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
  title: { color: colors.text, fontSize: 42, fontWeight: "800", letterSpacing: 0, lineHeight: 48, maxWidth: 480 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 16, maxWidth: 430 },
  benefits: { gap: 12, marginTop: 30 },
  benefit: { alignItems: "center", flexDirection: "row", gap: 10 },
  benefitMark: { color: colors.primary, fontSize: 18, fontWeight: "800" },
  benefitText: { color: colors.softText, fontSize: 13 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 22, borderWidth: 1, gap: 18, justifyContent: "center", maxWidth: 410, padding: 24, width: "100%" },
  cardShadow: Platform.select({ web: { boxShadow: "0 14px 24px rgba(0, 0, 0, 0.28)" }, default: { elevation: 8, shadowColor: colors.shadow, shadowOpacity: 0.28, shadowRadius: 24, shadowOffset: { height: 14, width: 0 } } }),
  cardHeader: { marginBottom: 8 },
  cardTitle: { color: colors.text, fontSize: 23, fontWeight: "800", marginBottom: 6 },
  cardSubtitle: { color: colors.muted, fontSize: 13 },
  registerRow: { alignItems: "center", flexDirection: "row", gap: 5, justifyContent: "center", marginTop: 2 },
  registerPrompt: { color: colors.muted, fontSize: 13 },
  registerLink: { color: colors.primary, fontSize: 13, fontWeight: "800" },
});
