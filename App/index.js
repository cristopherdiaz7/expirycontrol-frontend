import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FeedbackProvider, useFeedback } from "../components/FeedbackProvider";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/loginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { colors } from "../constants/colors";
import { SESSION_EXPIRED_MESSAGE } from "../services/api";
import { clearSession, getSession, saveSession } from "../services/sessionService";

function AppContent() {
  const { notify, dismiss } = useFeedback();
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
    dismiss();
    setAuth(result);
    setScreen("home");
  };

  const closeSession = async () => {
    await clearSession();
    setAuth(null);
    setScreen("login");
  };

  const handleLogout = async () => {
    await closeSession();
    dismiss();
  };

  const handleSessionExpired = async () => {
    await closeSession();
    notify(SESSION_EXPIRED_MESSAGE, { title: "Sesión finalizada", tone: "warning", duration: 7000 });
  };

  const handleRegistered = () => {
    setScreen("login");
    notify("Tu cuenta fue creada. Ahora inicia sesión.", { title: "Cuenta creada" });
  };

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (screen === "login") {
    return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setScreen("register")} />;
  }

  if (screen === "register") {
    return <RegisterScreen onRegister={handleRegistered} onCancel={() => setScreen("login")} />;
  }

  return <HomeScreen auth={auth} onLogout={handleLogout} onUnauthorized={handleSessionExpired} />;
}

export default function App() {
  return (
    <FeedbackProvider>
      <AppContent />
    </FeedbackProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
});
