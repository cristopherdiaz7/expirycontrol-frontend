import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Brand from "./Brand";
import { colors, fonts, glass, layout, radius, shadows } from "../constants/theme";

// Navegación flotante: barra superior en PC y barra inferior en móvil.
// Recibe la lista de secciones, así que admite sumar más sin cambiar el componente.
export default function NavBar({ items, current, onChange, onLogout, variant = "bottom", compact = false }) {
  if (variant === "top") {
    return (
      <View style={styles.topLayer} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Brand />
          <View style={styles.topItems}>
            {items.map((item) => {
              const active = item.key === current;
              return (
                <Pressable key={item.key} onPress={() => onChange(item.key)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={({ hovered }) => [styles.topItem, hovered && !active && styles.itemHovered, active && styles.topItemActive]}>
                  <Feather name={item.icon} size={16} color={active ? colors.primaryInk : colors.softText} />
                  <Text style={[styles.topLabel, active && styles.topLabelActive]}>{item.label}</Text>
                  {item.badge ? <View style={[styles.badge, active && styles.badgeActive]}><Text style={[styles.badgeText, active && styles.badgeTextActive]}>{item.badge}</Text></View> : null}
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={onLogout} accessibilityRole="button" accessibilityLabel="Cerrar sesión" style={({ hovered }) => [styles.logout, hovered && styles.itemHovered]}>
            <Feather name="log-out" size={16} color={colors.softText} />
            {compact ? null : <Text style={styles.logoutText}>Cerrar sesión</Text>}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.bottomLayer} pointerEvents="box-none">
      <View style={styles.bottomBar}>
        {items.map((item) => {
          const active = item.key === current;
          return (
            <Pressable key={item.key} onPress={() => onChange(item.key)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={styles.bottomItem}>
              <View style={[styles.bottomIcon, active && styles.bottomIconActive]}>
                <Feather name={item.icon} size={18} color={active ? colors.primaryInk : colors.softText} />
                {item.badge ? <View style={styles.dot}><Text style={styles.dotText}>{item.badge}</Text></View> : null}
              </View>
              <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]} numberOfLines={1}>{item.shortLabel || item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topLayer: { alignItems: "center", left: 0, paddingHorizontal: 20, position: "absolute", right: 0, top: 16, zIndex: 20 },
  topBar: { ...glass.strong, ...shadows.floating, alignItems: "center", borderRadius: radius.xl, flexDirection: "row", gap: 16, height: layout.navHeight, justifyContent: "space-between", maxWidth: layout.maxWidth, paddingHorizontal: 18, width: "100%" },
  topItems: { alignItems: "center", flexDirection: "row", gap: 6 },
  topItem: { alignItems: "center", borderRadius: radius.pill, flexDirection: "row", gap: 7, paddingHorizontal: 12, paddingVertical: 9 },
  topItemActive: { backgroundColor: colors.primary },
  itemHovered: { backgroundColor: "rgba(255, 255, 255, 0.06)" },
  topLabel: { color: colors.softText, fontFamily: fonts.semibold, fontSize: 13.5 },
  topLabelActive: { color: colors.primaryInk, fontFamily: fonts.bold },
  badge: { alignItems: "center", backgroundColor: colors.dangerSoft, borderRadius: radius.pill, justifyContent: "center", minWidth: 20, paddingHorizontal: 6, paddingVertical: 1 },
  badgeActive: { backgroundColor: "rgba(9, 32, 24, 0.16)" },
  badgeText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 11 },
  badgeTextActive: { color: colors.primaryInk },
  logout: { alignItems: "center", borderRadius: radius.pill, flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  logoutText: { color: colors.softText, fontFamily: fonts.semibold, fontSize: 13 },

  bottomLayer: { alignItems: "center", bottom: 14, left: 0, paddingHorizontal: 14, position: "absolute", right: 0, zIndex: 20 },
  bottomBar: { ...glass.strong, ...shadows.floating, borderRadius: radius.xl, flexDirection: "row", justifyContent: "space-between", maxWidth: 520, paddingHorizontal: 8, paddingVertical: 9, width: "100%" },
  bottomItem: { alignItems: "center", flex: 1, gap: 4, minWidth: 0 },
  bottomIcon: { alignItems: "center", borderRadius: radius.pill, height: 34, justifyContent: "center", width: 46 },
  bottomIconActive: { backgroundColor: colors.primary },
  bottomLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 10.5 },
  bottomLabelActive: { color: colors.primary, fontFamily: fonts.bold },
  dot: { alignItems: "center", backgroundColor: colors.danger, borderRadius: radius.pill, justifyContent: "center", minWidth: 16, paddingHorizontal: 4, position: "absolute", right: 4, top: -2 },
  dotText: { color: colors.background, fontFamily: fonts.bold, fontSize: 9.5 },
});
