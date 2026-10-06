import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/loginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { colors } from "../constants/colors";
import { clearSession, getSession, saveSession } from "../services/sessionService";

export default function App() {
	const [screen, setScreen] = useState("login");
	const [auth, setAuth] = useState(null);
	const [initializing, setInitializing] = useState(true);

	useEffect(() => {
		getSession()
			.then((session) => {
				if (session?.token) {
					setAuth(session);
					setScreen("home");
				}
			})
			.catch(() => clearSession())
			.finally(() => setInitializing(false));
	}, []);

	const handleLogin = async (result) => {
		await saveSession(result);
		setAuth(result);
		setScreen("home");
	};

	const handleLogout = async () => {
		await clearSession();
		setAuth(null);
		setScreen("login");
	};

	if (initializing) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator color={colors.primary} size="large" />
			</View>
		);
	}

	if (screen === "login") {
		return (
			<LoginScreen
				onLogin={handleLogin}
				onNavigateToRegister={() => setScreen("register")}
			/>
		);
	}

	if (screen === "register") {
		return (
			<RegisterScreen
				onRegister={() => setScreen("login")}
				onCancel={() => setScreen("login")}
			/>
		);
	}

	return <HomeScreen auth={auth} onLogout={handleLogout} onUnauthorized={handleLogout} />;
}

const styles = StyleSheet.create({
	loading: {
		alignItems: "center",
		backgroundColor: colors.background,
		flex: 1,
		justifyContent: "center",
	},
});