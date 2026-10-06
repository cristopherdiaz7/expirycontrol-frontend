import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "expirycontrol_session";

export async function getSession() {
  const storedSession = await AsyncStorage.getItem(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    await clearSession();
    return null;
  }
}

export function saveSession(session) {
  return AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  return AsyncStorage.removeItem(SESSION_KEY);
}
