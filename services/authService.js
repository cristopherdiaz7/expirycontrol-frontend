import { apiRequest } from "./api";

export function registerUser(data) {
  return apiRequest("/register", {
    method: "POST",
    data,
  });
}

export async function loginUser(data) {
  return apiRequest("/login", {
    method: "POST",
    data,
  });
}

// data: currentPassword y newPassword. El backend responde 204 sin cuerpo.
export function changePassword(token, data) {
  return apiRequest("/account/password", {
    method: "PUT",
    token,
    data,
  });
}
