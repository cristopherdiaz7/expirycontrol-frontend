import { apiRequest } from "./api";
import { getLocalToday } from "../utils/dates";

export function getProducts(token) {
  return apiRequest("/products", { token });
}

export function createProduct(token, product) {
  return apiRequest("/products", { method: "POST", token, body: JSON.stringify(product) });
}

export function updateProduct(token, id, product) {
  return apiRequest(`/products/${id}`, { method: "PUT", token, body: JSON.stringify(product) });
}

export function deleteProduct(token, id) {
  return apiRequest(`/products/${id}`, { method: "DELETE", token });
}

// El backend calcula vencimientos con la fecha local del usuario (parámetro today).
export function getExpiredProducts(token, today = getLocalToday()) {
  return apiRequest(`/products/expired?today=${today}`, { token });
}

export function getExpiringProducts(token, days = 7, today = getLocalToday()) {
  return apiRequest(`/products/expiring?days=${days}&today=${today}`, { token });
}

export function getProductStats(token, days = 7, today = getLocalToday()) {
  return apiRequest(`/products/stats?days=${days}&today=${today}`, { token });
}
