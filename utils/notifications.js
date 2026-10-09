// Categorías del centro de notificaciones, en el orden en que se muestran.
// Las claves coinciden con las que devuelve el backend.
export const NOTIFICATION_GROUPS = [
  { category: "EXPIRED", title: "Vencidos", tone: "danger", icon: "alert-octagon" },
  { category: "EXPIRES_TODAY", title: "Vencen hoy", tone: "danger", icon: "alert-circle" },
  { category: "WITHIN_3_DAYS", title: "En los próximos 3 días", tone: "warning", icon: "clock" },
  { category: "WITHIN_7_DAYS", title: "En los próximos 7 días", tone: "warning", icon: "clock" },
  { category: "WITHIN_14_DAYS", title: "En los próximos 14 días", tone: "warning", icon: "calendar" },
];

// Agrupa las notificaciones por categoría y descarta las categorías vacías.
// Cada producto llega del backend en una sola categoría, así que no se repite.
export function groupNotifications(notifications = []) {
  return NOTIFICATION_GROUPS
    .map((group) => {
      const items = notifications.filter((notification) => notification.category === group.category);
      return { ...group, items, unread: items.filter((item) => !item.read).length };
    })
    .filter((group) => group.items.length > 0);
}

// Texto que explica cuándo vence (o venció) el producto.
export function describeNotification(notification) {
  const days = notification.daysRemaining;

  if (days < 0) {
    const elapsed = Math.abs(days);
    return `Venció hace ${elapsed} día${elapsed === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Vence hoy";
  return `Vence en ${days} día${days === 1 ? "" : "s"}`;
}
