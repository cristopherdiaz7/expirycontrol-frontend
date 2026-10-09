import { apiRequest } from "./api";
import { getLocalToday } from "../utils/dates";

// El backend registra las pérdidas al consultarlas, con la fecha local del usuario.
export function getLosses(token, today = getLocalToday()) {
  return apiRequest(`/losses?today=${today}`, { token });
}

export function getLossStats(token, today = getLocalToday()) {
  return apiRequest(`/losses/stats?today=${today}`, { token });
}
