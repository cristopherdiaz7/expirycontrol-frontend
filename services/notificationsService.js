import { apiRequest } from "./api";
import { getLocalToday } from "../utils/dates";

// Las tres llamadas devuelven { unreadCount, notifications } ya actualizado.
export function getNotifications(token, today = getLocalToday()) {
  return apiRequest(`/notifications?today=${today}`, { token });
}

export function markNotificationRead(token, productId, today = getLocalToday()) {
  return apiRequest(`/notifications/${productId}/read?today=${today}`, { method: "POST", token });
}

export function markAllNotificationsRead(token, today = getLocalToday()) {
  return apiRequest(`/notifications/read-all?today=${today}`, { method: "POST", token });
}
