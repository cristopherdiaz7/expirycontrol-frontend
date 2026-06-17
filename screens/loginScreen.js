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

export default function LoginScreen({ onLogin }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = () => {
		Alert.alert(
			"Modo práctica",
			`Usuario: ${username || "(vacío)"}\nContraseña: ${password ? "capturada" : "vacía"}`
		);

		if (onLogin) {
			onLogin();
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
						<Text style={styles.title}>Controla productos antes de que venza la fecha</Text>
						<Text style={styles.subtitle}>
							Pantalla de login hecha solo para practicar componentes y estados con useState.
						</Text>
					</View>

					<View style={styles.card}>
						<TextField
							label="Nombre de usuario"
							value={username}
							onChangeText={setUsername}
							placeholder="Escribe tu usuario"
						/>

						<TextField
							label="Contraseña"
							value={password}
							onChangeText={setPassword}
							placeholder="Escribe tu contraseña"
							secureTextEntry
						/>

						<CustomButton title="Ingresar" onPress={handleLogin} />

						<Text style={styles.helperText}>
							Más adelante aquí podrás conectar autenticación real y navegar a la pantalla principal.
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
});
