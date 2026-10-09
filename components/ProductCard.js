import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import { colors, fonts, glass, radius, tones, type } from "../constants/theme";
import { formatARS } from "../utils/currency";
import { daysUntil } from "../utils/dates";

// Mismas reglas que el backend: vencido si la fecha es hoy o anterior,
// por vencer si cae dentro de los días del filtro elegido.
function getProductStatus(expirationDate, soonDays) {
  const days = daysUntil(expirationDate);

  if (days === null) return { label: "Sin fecha", tone: "warning", icon: "help-circle", detail: "Fecha inválida" };
  if (days <= 0) return { label: "Vencido", tone: "danger", icon: "alert-octagon", detail: days === 0 ? "Vence hoy" : "Requiere atención" };
  if (days <= soonDays) return { label: "Por vencer", tone: "warning", icon: "clock", detail: `En ${days} día${days === 1 ? "" : "s"}` };
  return { label: "Vigente", tone: "success", icon: "check-circle", detail: `En ${days} días` };
}

function Detail({ icon, label, value, color = colors.text }) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailLabelRow}>
        <Feather name={icon} size={12} color={colors.muted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function ProductCard({ product, soonDays = 7, onEdit, onDelete, style }) {
  const status = getProductStatus(product.expirationDate, soonDays);
  const palette = tones[status.tone];
  const hasPrice = product.unitPrice !== null && product.unitPrice !== undefined;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={[styles.icon, { backgroundColor: palette.bg }]}>
          <Feather name="package" size={18} color={palette.fg} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.category} numberOfLines={1}>{product.category}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Feather name={status.icon} size={12} color={palette.fg} />
          <Text style={[styles.badgeText, { color: palette.fg }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>{product.description}</Text>

      <View style={styles.detailsRow}>
        <Detail icon="calendar" label="Vencimiento" value={product.expirationDate} />
        <Detail icon="activity" label="Estado" value={status.detail} color={palette.fg} />
        <Detail icon="layers" label="Cantidad" value={`${product.quantity} un.`} />
        <Detail icon="dollar-sign" label="Precio unitario" value={formatARS(product.unitPrice)} color={hasPrice ? colors.text : colors.muted} />
      </View>

      <View style={styles.actions}>
        <CustomButton title="Editar" icon="edit-2" size="sm" variant="secondary" onPress={() => onEdit(product)} style={styles.action} />
        <CustomButton title="Eliminar" icon="trash-2" size="sm" variant="danger" onPress={() => onDelete(product)} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...glass.surface, borderRadius: radius.xl, padding: 18 },
  topRow: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  icon: { alignItems: "center", borderRadius: radius.md, height: 40, justifyContent: "center", width: 40 },
  titleBlock: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 16.5, letterSpacing: -0.2, lineHeight: 22 },
  category: { ...type.label, color: colors.primary, marginTop: 4 },
  badge: { alignItems: "center", borderRadius: radius.pill, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11.5 },
  description: { ...type.body, fontSize: 13.5, lineHeight: 20, marginTop: 14 },
  detailsRow: { borderBottomColor: colors.glassBorder, borderBottomWidth: 1, borderTopColor: colors.glassBorder, borderTopWidth: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 16, paddingVertical: 13, rowGap: 14 },
  // Dos columnas: cuatro datos en una sola fila no entran en una tarjeta angosta.
  detail: { flexBasis: "48%" },
  detailLabelRow: { alignItems: "center", flexDirection: "row", gap: 5, marginBottom: 5 },
  detailLabel: { ...type.label, fontSize: 10 },
  detailValue: { fontFamily: fonts.semibold, fontSize: 13 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  action: { flex: 1 },
});
