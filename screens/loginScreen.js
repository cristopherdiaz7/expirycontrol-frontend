import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import CustomButton from "../components/customButton";
import TextField from "../components/TextField";
import { colors } from "../constants/colors";
import { loginUser } from "../services/authService";

export default function LoginScreen({ onLogin, onNavigateToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Faltan campos", "Completá email y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser({ email, password });
      if (onLogin) await onLogin(result);
    } catch (error) {
      Alert.alert("Error al iniciar sesión", error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.brand}>ExpiryControl</Text>
            <Text style={styles.title}>Controla productos antes de que venza la fecha</Text>
            <Text style={styles.subtitle}>Inicia sesión para consultar tus productos.</Text>
          </View>
          <View style={styles.card}>
            <TextField label="Email" value={email} onChangeText={setEmail} placeholder="nombre@ejemplo.com" />
            <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="Escribe tu contraseña" secureTextEntry />
            <CustomButton title={loading ? "Ingresando..." : "Ingresar"} onPress={handleLogin} disabled={loading} />
            <Text style={styles.registerText} onPress={() => (onNavigateToRegister ? onNavigateToRegister() : null)}>¿No tenés cuenta? Registrate</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 20 },
  hero: { marginBottom: 24 },
  brand: { color: colors.primary, fontSize: 14, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 30, fontWeight: "800", lineHeight: 36, marginBottom: 10 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 24, borderWidth: 1, gap: 16, padding: 20 },
  registerText: { color: colors.primary, fontSize: 14, marginTop: 12, textAlign: "center", textDecorationLine: "underline" },
});
