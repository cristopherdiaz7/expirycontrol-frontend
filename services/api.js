import axios from "axios";

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

// Si el servidor no responde en este tiempo, la petición se corta y se muestra el error de conexión.
export const REQUEST_TIMEOUT_MS = 15000;

// Cliente de Axios con la dirección del backend. Todas las peticiones de la app pasan por acá.
// Axios convierte el cuerpo a JSON y la respuesta de JSON a objeto sin hacerlo a mano.
const client = axios.create({ baseURL: baseUrl, timeout: REQUEST_TIMEOUT_MS });

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

// options: method (GET por defecto), token (JWT de la sesión) y data (cuerpo de la petición).
export async function apiRequest(path, options = {}) {
  if (!baseUrl) {
    throw new ApiError("No está configurada la URL del servidor.", 0);
  }

  const { token, method = "GET", data } = options;

  try {
    const response = await client.request({
      url: path,
      method,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    // Una respuesta sin cuerpo (por ejemplo, 204 al eliminar) llega como texto vacío.
    return response.data === "" || response.data === undefined ? null : response.data;
  } catch (requestError) {
    // Sin respuesta del servidor: no hubo conexión o tardó más que el límite.
    if (!requestError.response) {
      throw new ApiError("No se pudo conectar con el servidor.", 0);
    }

    const { status, data: payload } = requestError.response;
    const error = new ApiError(getErrorMessage(status, payload, Boolean(token)), status);
    error.sessionExpired = status === 401 && Boolean(token);
    throw error;
  }
}
