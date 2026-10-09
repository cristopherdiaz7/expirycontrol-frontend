import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import { colors, fonts, glass, radius, tones, type } from "../constants/theme";
import { describeNotification, groupNotifications } from "../utils/notifications";

function NotificationItem({ notification, tone, busy, onMarkRead }) {
  const palette = tones[tone];

  return (
    <View style={[styles.item, notification.read && styles.itemRead]}>
      <View style={[styles.marker, { backgroundColor: notification.read ? "transparent" : palette.fg }]} />
      <View style={styles.itemCopy}>
        <Text style={[styles.itemName, notification.read && styles.itemNameRead]} numberOfLines={2}>{notification.productName}</Text>
        <View style={styles.itemMeta}>
          <Text style={[styles.itemWhen, { color: notification.read ? colors.muted : palette.fg }]}>{describeNotification(notification)}</Text>
          <Text style={styles.itemDate}>· {notification.expirationDate}</Text>
        </View>
      </View>
      {notification.read ? (
        <View style={styles.readTag}>
          <Feather name="check" size={13} color={colors.muted} />
          <Text style={styles.readTagText}>Leída</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => onMarkRead(notification)}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={`Marcar como leída la notificación de ${notification.productName}`}
          style={({ hovered, pressed }) => [styles.markButton, hovered && styles.markButtonHovered, (pressed || busy) && styles.markButtonPressed]}
        >
          <Feather name="check" size={14} color={colors.text} />
          <Text style={styles.markButtonText}>Marcar leída</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function NotificationCenter({ data, loading, error, busy, onMarkRead, onMarkAllRead, onRetry }) {
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const groups = groupNotifications(notifications);

  if (loading && !data) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateBox}>
        <View style={[styles.stateIcon, { backgroundColor: colors.dangerSoft }]}><Feather name="wifi-off" size={22} color={colors.danger} /></View>
        <Text style={styles.stateTitle}>No pudimos cargar las notificaciones</Text>
        <Text style={styles.stateText}>{error}</Text>
        <CustomButton title="Reintentar" icon="refresh-cw" size="sm" variant="secondary" onPress={onRetry} style={styles.stateAction} />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.stateBox}>
        <View style={styles.stateIcon}><Feather name="bell-off" size={22} color={colors.primary} /></View>
        <Text style={styles.stateTitle}>Sin notificaciones</Text>
        <Text style={styles.stateText}>No tienes productos vencidos ni que venzan en los próximos 14 días.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.summary}>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>{unreadCount === 0 ? "Estás al día" : `${unreadCount} sin leer`}</Text>
          <Text style={styles.summaryText}>{notifications.length} notificaci{notifications.length === 1 ? "ón" : "ones"} en total</Text>
        </View>
        <CustomButton title="Marcar todas como leídas" icon="check-circle" size="sm" variant="secondary" onPress={onMarkAllRead} disabled={busy || unreadCount === 0} />
      </View>

      {groups.map((group) => {
        const palette = tones[group.tone];
        return (
          <View key={group.category} style={styles.group}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupIcon, { backgroundColor: palette.bg }]}>
                <Feather name={group.icon} size={15} color={palette.fg} />
              </View>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={[styles.groupCount, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                <Text style={[styles.groupCountText, { color: palette.fg }]}>{group.items.length}</Text>
              </View>
            </View>
            <View style={[styles.groupCard, { borderLeftColor: palette.fg }]}>
              {group.items.map((notification, index) => (
                <View key={notification.productId} style={index > 0 && styles.divider}>
                  <NotificationItem notification={notification} tone={group.tone} busy={busy} onMarkRead={onMarkRead} />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { ...glass.surface, alignItems: "center", borderRadius: radius.lg, flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 22, paddingHorizontal: 16, paddingVertical: 14 },
  summaryCopy: { flexShrink: 1 },
  summaryTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15.5 },
  summaryText: { ...type.small, marginTop: 2 },

  group: { marginBottom: 22 },
  groupHeader: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 10 },
  groupIcon: { alignItems: "center", borderRadius: radius.sm, height: 30, justifyContent: "center", width: 30 },
  groupTitle: { ...type.subheading, flexShrink: 1 },
  groupCount: { alignItems: "center", borderRadius: radius.pill, borderWidth: 1, justifyContent: "center", minWidth: 26, paddingHorizontal: 8, paddingVertical: 2 },
  groupCountText: { fontFamily: fonts.bold, fontSize: 12 },
  groupCard: { ...glass.surface, borderLeftWidth: 3, borderRadius: radius.lg, overflow: "hidden" },
  divider: { borderTopColor: colors.glassBorder, borderTopWidth: 1 },

  item: { alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  itemRead: { opacity: 0.62 },
  marker: { borderRadius: radius.pill, height: 8, width: 8 },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  itemNameRead: { fontFamily: fonts.medium },
  itemMeta: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 3 },
  itemWhen: { fontFamily: fonts.semibold, fontSize: 13 },
  itemDate: { ...type.small },
  readTag: { alignItems: "center", flexDirection: "row", gap: 5, paddingHorizontal: 6 },
  readTagText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  markButton: { alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: colors.glassBorder, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 6, paddingHorizontal: 11, paddingVertical: 8 },
  markButtonHovered: { borderColor: colors.borderStrong },
  markButtonPressed: { opacity: 0.6 },
  markButtonText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12.5 },

  stateBox: { ...glass.surface, alignItems: "center", borderRadius: radius.xl, paddingHorizontal: 24, paddingVertical: 36 },
  stateIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radius.lg, height: 52, justifyContent: "center", marginBottom: 14, width: 52 },
  stateTitle: { ...type.heading, fontSize: 17, marginBottom: 6, textAlign: "center" },
  stateText: { ...type.body, fontSize: 13.5, marginTop: 4, maxWidth: 360, textAlign: "center" },
  stateAction: { marginTop: 18 },
});
