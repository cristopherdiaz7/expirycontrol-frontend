import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import StatCard from "./StatCard";
import { colors, fonts, glass, radius, spacing, tones, type } from "../constants/theme";
import { formatARS, formatMonth } from "../utils/currency";

function LossItem({ loss, compact }) {
  return (
    <View style={[styles.item, compact && styles.itemCompact]}>
      <View style={styles.itemIcon}>
        <Feather name="trending-down" size={16} color={colors.danger} />
      </View>
      <View style={styles.itemCopy}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemName} numberOfLines={2}>{loss.productName}</Text>
          {loss.productDeleted ? (
            <View style={styles.deletedTag}>
              <Feather name="trash-2" size={11} color={colors.muted} />
              <Text style={styles.deletedTagText}>Producto eliminado</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.itemMeta}>{loss.quantity} un. × {formatARS(loss.unitPrice)}</Text>
        <View style={styles.itemDateRow}>
          <Feather name="calendar" size={12} color={colors.muted} />
          <Text style={styles.itemDate}>Venció el {loss.expirationDate}</Text>
        </View>
      </View>
      <View style={[styles.itemAmountBlock, compact && styles.itemAmountBlockCompact]}>
        <Text style={styles.itemAmountLabel}>Importe total</Text>
        <Text style={styles.itemAmount}>{formatARS(loss.totalAmount)}</Text>
      </View>
    </View>
  );
}

export default function LossCenter({ losses, stats, loading, error, onRetry, productsWithoutPrice = 0, statWidth, compact = false }) {
  if (loading && !stats) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Cargando pérdidas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateBox}>
        <View style={[styles.stateIcon, { backgroundColor: colors.dangerSoft }]}><Feather name="wifi-off" size={22} color={colors.danger} /></View>
        <Text style={styles.stateTitle}>No pudimos cargar las pérdidas</Text>
        <Text style={styles.stateText}>{error}</Text>
        <CustomButton title="Reintentar" icon="refresh-cw" size="sm" variant="secondary" onPress={onRetry} style={styles.stateAction} />
      </View>
    );
  }

  const list = losses || [];
  const months = stats?.byMonth || [];
  const highestMonth = months.reduce((highest, month) => Math.max(highest, Number(month.totalAmount)), 0);

  const priceNotice = productsWithoutPrice > 0 ? (
    <View style={styles.notice}>
      <Feather name="info" size={16} color={colors.warning} />
      <Text style={styles.noticeText}>
        {productsWithoutPrice === 1 ? "Hay 1 producto sin precio." : `Hay ${productsWithoutPrice} productos sin precio.`} Edítalos para que sus pérdidas se registren.
      </Text>
    </View>
  ) : null;

  if (list.length === 0) {
    return (
      <View>
        {priceNotice}
        <View style={styles.stateBox}>
          <View style={styles.stateIcon}><Feather name="shield" size={22} color={colors.primary} /></View>
          <Text style={styles.stateTitle}>Sin pérdidas registradas</Text>
          <Text style={styles.stateText}>Cuando un producto con precio venza, su importe aparecerá aquí.</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {priceNotice}

      <View style={styles.grid}>
        <StatCard label="Importe total perdido" icon="trending-down" tone="danger" value={formatARS(stats?.totalAmount ?? 0)} style={{ width: statWidth }} valueSize={24} />
        <StatCard label="Pérdidas registradas" icon="file-text" value={stats?.lossCount ?? 0} style={{ width: statWidth }} valueSize={24} />
        <StatCard label="Unidades perdidas" icon="layers" tone="warning" value={stats?.unitsLost ?? 0} style={{ width: statWidth }} valueSize={24} />
      </View>

      <Text style={styles.sectionTitle}>Importe por mes</Text>
      <View style={styles.card}>
        {months.map((month, index) => {
          const share = highestMonth > 0 ? Math.max(Number(month.totalAmount) / highestMonth, 0.02) : 0;
          return (
            <View key={month.month} style={[styles.month, index > 0 && styles.divider]}>
              <View style={styles.monthHeader}>
                <View style={styles.monthCopy}>
                  <Text style={styles.monthName}>{formatMonth(month.month)}</Text>
                  <Text style={styles.monthMeta}>{month.lossCount} pérdida{month.lossCount === 1 ? "" : "s"} · {month.unitsLost} un.</Text>
                </View>
                <Text style={styles.monthAmount}>{formatARS(month.totalAmount)}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${share * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Historial</Text>
      <View style={styles.card}>
        {list.map((loss, index) => (
          <View key={loss.id} style={index > 0 && styles.divider}>
            <LossItem loss={loss} compact={compact} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  sectionTitle: { ...type.heading, marginBottom: 12, marginTop: spacing.xxl },
  card: { ...glass.surface, borderRadius: radius.lg, overflow: "hidden" },
  divider: { borderTopColor: colors.glassBorder, borderTopWidth: 1 },

  notice: { alignItems: "center", backgroundColor: tones.warning.bg, borderColor: tones.warning.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: "row", gap: 10, marginBottom: 18, paddingHorizontal: 14, paddingVertical: 12 },
  noticeText: { color: colors.softText, flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },

  month: { gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  monthHeader: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  monthCopy: { flexShrink: 1 },
  monthName: { color: colors.text, fontFamily: fonts.bold, fontSize: 14.5 },
  monthMeta: { ...type.small, marginTop: 2 },
  monthAmount: { color: colors.danger, fontFamily: fonts.bold, fontSize: 15 },
  barTrack: { backgroundColor: "rgba(255, 255, 255, 0.06)", borderRadius: radius.pill, height: 6, overflow: "hidden" },
  barFill: { backgroundColor: colors.danger, borderRadius: radius.pill, height: 6 },

  item: { alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  itemCompact: { alignItems: "flex-start", flexWrap: "wrap" },
  itemIcon: { alignItems: "center", backgroundColor: colors.dangerSoft, borderRadius: radius.md, height: 36, justifyContent: "center", width: 36 },
  itemCopy: { flex: 1, gap: 3, minWidth: 0 },
  itemTitleRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  itemName: { color: colors.text, flexShrink: 1, fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  deletedTag: { alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: colors.glassBorder, borderRadius: radius.pill, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 3 },
  deletedTagText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11 },
  itemMeta: { color: colors.softText, fontFamily: fonts.medium, fontSize: 13 },
  itemDateRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  itemDate: { ...type.small },
  itemAmountBlock: { alignItems: "flex-end" },
  itemAmountBlockCompact: { alignItems: "flex-start", flexBasis: "100%", paddingLeft: 48 },
  itemAmountLabel: { ...type.label, fontSize: 10, marginBottom: 3 },
  itemAmount: { color: colors.danger, fontFamily: fonts.extrabold, fontSize: 16.5, letterSpacing: -0.2 },

  stateBox: { ...glass.surface, alignItems: "center", borderRadius: radius.xl, paddingHorizontal: 24, paddingVertical: 36 },
  stateIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radius.lg, height: 52, justifyContent: "center", marginBottom: 14, width: 52 },
  stateTitle: { ...type.heading, fontSize: 17, marginBottom: 6, textAlign: "center" },
  stateText: { ...type.body, fontSize: 13.5, marginTop: 4, maxWidth: 360, textAlign: "center" },
  stateAction: { marginTop: 18 },
});
