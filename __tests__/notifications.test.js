import { apiRequest } from "../services/api";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notificationsService";
import { NOTIFICATION_GROUPS, describeNotification, groupNotifications } from "../utils/notifications";

jest.mock("../services/api", () => ({ apiRequest: jest.fn() }));

const TOKEN = "token-de-prueba";

describe("notificationsService", () => {
  beforeEach(() => {
    apiRequest.mockReset();
    // 23:30 local: en UTC-3 el servidor ya está en el día siguiente.
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 8, 23, 30));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("listar envía today con la fecha local", () => {
    getNotifications(TOKEN);

    expect(apiRequest).toHaveBeenCalledWith("/notifications?today=2026-10-08", { token: TOKEN });
  });

  it("marcar una envía POST al producto indicado", () => {
    markNotificationRead(TOKEN, 12);

    expect(apiRequest).toHaveBeenCalledWith("/notifications/12/read?today=2026-10-08", { method: "POST", token: TOKEN });
  });

  it("marcar todas envía POST a read-all", () => {
    markAllNotificationsRead(TOKEN);

    expect(apiRequest).toHaveBeenCalledWith("/notifications/read-all?today=2026-10-08", { method: "POST", token: TOKEN });
  });

  it("devuelve la respuesta del servidor", async () => {
    const response = { unreadCount: 0, notifications: [] };
    apiRequest.mockResolvedValue(response);

    await expect(markAllNotificationsRead(TOKEN)).resolves.toBe(response);
  });
});

describe("groupNotifications", () => {
  const notification = (productId, category, read = false) => ({ productId, productName: `Producto ${productId}`, category, read });

  it("agrupa por categoría en orden de urgencia y omite las vacías", () => {
    const groups = groupNotifications([
      notification(1, "WITHIN_14_DAYS"),
      notification(2, "EXPIRED"),
      notification(3, "WITHIN_3_DAYS"),
      notification(4, "EXPIRED"),
    ]);

    expect(groups.map((group) => group.category)).toEqual(["EXPIRED", "WITHIN_3_DAYS", "WITHIN_14_DAYS"]);
    expect(groups[0].items.map((item) => item.productId)).toEqual([2, 4]);
  });

  it("no repite productos entre categorías", () => {
    const notifications = NOTIFICATION_GROUPS.map((group, index) => notification(index + 1, group.category));

    const ids = groupNotifications(notifications).flatMap((group) => group.items.map((item) => item.productId));

    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
  });

  it("cuenta las no leídas de cada grupo", () => {
    const groups = groupNotifications([
      notification(1, "EXPIRED", true),
      notification(2, "EXPIRED", false),
      notification(3, "WITHIN_7_DAYS", true),
    ]);

    expect(groups.map((group) => group.unread)).toEqual([1, 0]);
  });

  it("usa rojo para vencidos y vence hoy, y ámbar para los próximos", () => {
    const tones = Object.fromEntries(NOTIFICATION_GROUPS.map((group) => [group.category, group.tone]));

    expect(tones).toEqual({
      EXPIRED: "danger",
      EXPIRES_TODAY: "danger",
      WITHIN_3_DAYS: "warning",
      WITHIN_7_DAYS: "warning",
      WITHIN_14_DAYS: "warning",
    });
  });

  it("devuelve una lista vacía si no hay notificaciones", () => {
    expect(groupNotifications([])).toEqual([]);
    expect(groupNotifications()).toEqual([]);
  });
});

describe("describeNotification", () => {
  it("describe los productos vencidos", () => {
    expect(describeNotification({ daysRemaining: -1 })).toBe("Venció hace 1 día");
    expect(describeNotification({ daysRemaining: -5 })).toBe("Venció hace 5 días");
  });

  it("describe el que vence hoy", () => {
    expect(describeNotification({ daysRemaining: 0 })).toBe("Vence hoy");
  });

  it("describe los próximos vencimientos", () => {
    expect(describeNotification({ daysRemaining: 1 })).toBe("Vence en 1 día");
    expect(describeNotification({ daysRemaining: 14 })).toBe("Vence en 14 días");
  });
});
