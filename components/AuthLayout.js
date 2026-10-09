import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import AppBackground from "./AppBackground";
import Brand from "./Brand";
import { colors, fonts, glass, radius, shadows, spacing, type } from "../constants/theme";
import useBreakpoint from "../utils/useBreakpoint";

// Estructura común de Login y Registro: presentación a la izquierda y formulario en una tarjeta.
export default function AuthLayout({ kicker, title, subtitle, benefits = [], cardTitle, cardSubtitle, children }) {
  const { isDesktop } = useBreakpoint();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppBackground />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.shell, isDesktop && styles.shellWide]}>
            <View style={[styles.hero, isDesktop && styles.heroWide]}>
              <View style={styles.brand}><Brand /></View>
              <Text style={styles.kicker}>{kicker}</Text>
              <Text style={[styles.title, !isDesktop && styles.titleCompact]}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              {benefits.length > 0 ? (
                <View style={styles.benefits}>
                  {benefits.map((benefit) => (
                    <View key={benefit.text} style={styles.benefit}>
                      <View style={styles.benefitIcon}><Feather name={benefit.icon} size={15} color={colors.primary} /></View>
                      <Text style={styles.benefitText}>{benefit.text}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{cardTitle}</Text>
                <Text style={styles.cardSubtitle}>{cardSubtitle}</Text>
              </View>
              {children}
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
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: spacing.page, paddingVertical: 32 },
  shell: { alignSelf: "center", gap: 28, maxWidth: 440, width: "100%" },
  shellWide: { alignItems: "center", flexDirection: "row", gap: 56, maxWidth: 1040 },
  hero: { justifyContent: "center" },
  heroWide: { flex: 1 },
  brand: { marginBottom: 36 },
  kicker: { ...type.kicker, marginBottom: 12 },
  title: { ...type.display, maxWidth: 500 },
  titleCompact: { fontSize: 30, lineHeight: 36 },
  subtitle: { ...type.body, fontSize: 15.5, lineHeight: 24, marginTop: 14, maxWidth: 440 },
  benefits: { gap: 12, marginTop: 28 },
  benefit: { alignItems: "center", flexDirection: "row", gap: 12 },
  benefitIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radius.md, height: 32, justifyContent: "center", width: 32 },
  benefitText: { color: colors.softText, fontFamily: fonts.medium, fontSize: 14 },
  card: { ...glass.surface, ...shadows.card, borderRadius: radius.xl, gap: 16, maxWidth: 440, padding: 26, width: "100%" },
  cardHeader: { marginBottom: 6 },
  cardTitle: { ...type.title, fontSize: 24, lineHeight: 30, marginBottom: 6 },
  cardSubtitle: { ...type.body, color: colors.muted, fontSize: 13.5 },
});
