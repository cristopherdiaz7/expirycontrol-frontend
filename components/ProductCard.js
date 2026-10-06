import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

function getProductStatus(expirationDate) {
  const today = new Date();
  const date = new Date(`${expirationDate}T00:00:00`);
  const days = Math.ceil((date - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);

  if (days <= 0) return { label: "Vencido", tone: "danger", detail: days === 0 ? "Vence hoy" : "Requiere atención" };
  if (days <= 7) return { label: "Por vencer", tone: "warning", detail: `En ${days} día${days === 1 ? "" : "s"}` };
  return { label: "Vigente", tone: "success", detail: `En ${days} días` };
}

export default function ProductCard({ product, onEdit, onDelete }) {
  const status = getProductStatus(product.expirationDate);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>
        <View style={[styles.badge, styles[status.tone]]}><Text style={[styles.badgeText, styles[`${status.tone}Text`]]}>{status.label}</Text></View>
      </View>
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.detailsRow}>
        <View><Text style={styles.detailLabel}>Vencimiento</Text><Text style={styles.date}>{product.expirationDate}</Text></View>
        <View><Text style={styles.detailLabel}>Cantidad</Text><Text style={styles.quantity}>{product.quantity} un.</Text></View>
        <View><Text style={styles.detailLabel}>Estado</Text><Text style={[styles.statusDetail, styles[`${status.tone}Text`]]}>{status.detail}</Text></View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => onEdit(product)} style={styles.editButton}><Text style={styles.editText}>Editar</Text></Pressable>
        <Pressable onPress={() => onDelete(product)} style={styles.deleteButton}><Text style={styles.deleteText}>Eliminar</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18, borderWidth: 1, padding: 18 },
  topRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  titleBlock: { flex: 1, paddingRight: 12 },
  name: { color: colors.text, fontSize: 18, fontWeight: "800", letterSpacing: 0, marginBottom: 5 },
  category: { color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 0.3, textTransform: "uppercase" },
  badge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  danger: { backgroundColor: colors.dangerSoft },
  warning: { backgroundColor: colors.warningSoft },
  success: { backgroundColor: colors.successSoft },
  dangerText: { color: colors.danger },
  warningText: { color: colors.warning },
  successText: { color: colors.success },
  description: { color: colors.softText, fontSize: 13, lineHeight: 19, marginTop: 16 },
  detailsRow: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingVertical: 13 },
  detailLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", marginBottom: 5, textTransform: "uppercase" },
  date: { color: colors.text, fontSize: 13, fontWeight: "700" },
  quantity: { color: colors.text, fontSize: 13, fontWeight: "700" },
  statusDetail: { fontSize: 13, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 15 },
  editButton: { borderColor: colors.borderStrong, borderRadius: 9, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  editText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  deleteButton: { backgroundColor: colors.dangerSoft, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  deleteText: { color: colors.danger, fontSize: 12, fontWeight: "800" },
});
