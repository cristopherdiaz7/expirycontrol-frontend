import { useState } from "react";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/loginScreen";

export default function App() {
	const [screen, setScreen] = useState("login");

	return screen === "login" ? (
		<LoginScreen onLogin={() => setScreen("home")} />
	) : (
		<HomeScreen onLogout={() => setScreen("login")} />
	);
}