import { apiRequest } from "./api";

export function registerUser(data) {
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
