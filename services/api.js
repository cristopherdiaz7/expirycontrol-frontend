const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión nuevamente.";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Un 401 en una petición con token significa sesión vencida.
export function isSessionExpired(error) {
  return error instanceof ApiError && error.status === 401 && error.sessionExpired === true;
}

function getErrorMessage(status, payload, hadToken) {
  if (status === 401) {
    // Sin token el 401 viene del login: se muestra el motivo que envía el servidor.
    return hadToken ? SESSION_EXPIRED_MESSAGE : payload?.error || "Email o contraseña incorrectos.";
  }

  if (status === 404) {
    return "El producto ya no existe.";
  }

  if (status === 409) {
    return "Ya existe una cuenta con ese email.";
  }

  if (status >= 500) {
    return "El servidor no está disponible en este momento.";
  }

  if (payload?.details && typeof payload.details === "object") {
    return Object.values(payload.details).join(" ");
  }

  return payload?.error || "No se pudo completar la operación.";
}

export async function apiRequest(path, options = {}) {
  if (!baseUrl) {
    throw new ApiError("No está configurada la URL del servidor.", 0);
  }

  const { token, ...requestOptions } = options;
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...requestOptions,
      headers: {
        ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...requestOptions.headers,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  const responseText = await response.text();
  let payload = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = new ApiError(getErrorMessage(response.status, payload, Boolean(token)), response.status);
    error.sessionExpired = response.status === 401 && Boolean(token);
    throw error;
  }

  return payload;
}
