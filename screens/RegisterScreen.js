import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import CustomButton from "../components/customButton";
import TextField from "../components/TextField";
import { colors } from "../constants/colors";
import { registerUser } from "../services/authService";

export default function RegisterScreen({ onRegister, onCancel }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!name || !email || !password) {
			Alert.alert("Faltan campos", "Completá nombre, email y contraseña.");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Las contraseñas no coinciden.");
			return;
		}

		try {
			setLoading(true);
			await registerUser({ name, email, password });
			Alert.alert("Registro completado", "Tu cuenta fue creada. Ahora inicia sesión.");

			if (onRegister) onRegister();
		} catch (err) {
			Alert.alert("Error al registrar", err.message || String(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" backgroundColor={colors.background} />
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
					<View style={styles.hero}>
						<Text style={styles.brand}>ExpiryControl</Text>
						<Text style={styles.title}>Crear una cuenta</Text>
						<Text style={styles.subtitle}>Completa los datos para registrarte en la app.</Text>
					</View>

					<View style={styles.card}>
						<TextField label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
						<TextField label="Email" value={email} onChangeText={setEmail} placeholder="nombre@ejemplo.com" />
						<TextField
							label="Contraseña"
							value={password}
							onChangeText={setPassword}
							placeholder="Contraseña"
							secureTextEntry
						/>
						<TextField
							label="Confirmar contraseña"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="Repetir contraseña"
							secureTextEntry
						/>

						<CustomButton title={loading ? "Registrando..." : "Registrarse"} onPress={handleSubmit} disabled={loading} />

						<Text style={styles.helperText}>Después del registro volverás al login para iniciar sesión.</Text>

						<Text style={styles.cancelText} onPress={() => (onCancel ? onCancel() : null)}>
							Volver al login
						</Text>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: colors.background,
		flex: 1,
	},
	flex: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		justifyContent: "center",
		padding: 20,
	},
	hero: {
		marginBottom: 24,
	},
	brand: {
		color: colors.primary,
		fontSize: 14,
		fontWeight: "800",
		letterSpacing: 1.5,
		marginBottom: 10,
		textTransform: "uppercase",
	},
	title: {
		color: colors.text,
		fontSize: 30,
		fontWeight: "800",
		lineHeight: 36,
		marginBottom: 10,
	},
	subtitle: {
		color: colors.muted,
		fontSize: 15,
		lineHeight: 22,
	},
	card: {
		backgroundColor: colors.card,
		borderColor: colors.border,
		borderRadius: 24,
		borderWidth: 1,
		gap: 16,
		padding: 20,
	},
	helperText: {
		color: colors.muted,
		fontSize: 13,
		lineHeight: 19,
		textAlign: "center",
	},
	cancelText: {
		color: colors.primary,
		fontSize: 14,
		textAlign: "center",
		marginTop: 12,
		textDecorationLine: "underline",
	},
});
