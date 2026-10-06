import { apiRequest } from "./api";

export function getProducts(token) {
  return apiRequest("/products", { token });
}

export function createProduct(token, product) {
  return apiRequest("/products", {
    method: "POST",
    token,
    body: JSON.stringify(product),
  });
}

export function updateProduct(token, id, product) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(product),
  });
}

export function deleteProduct(token, id) {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getExpiredProducts(token) {
  return apiRequest("/products/expired", { token });
}

export function getExpiringProducts(token, days = 7) {
  return apiRequest(`/products/expiring?days=${days}`, { token });
}

export function getProductStats(token, days = 7) {
  return apiRequest(`/products/stats?days=${days}`, { token });
}
