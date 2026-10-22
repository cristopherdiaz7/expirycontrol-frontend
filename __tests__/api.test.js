const API_URL = "http://localhost:8080";

// Respuesta correcta tal como la entrega Axios.
function ok(status, data = "") {
  return { status, data };
}

// Error con respuesta del servidor, tal como lo lanza Axios para los códigos 4xx y 5xx.
function httpError(status, data = "") {
  const error = new Error(`Request failed with status code ${status}`);
  error.response = { status, data };
  return error;
}

// api.js lee la URL y crea el cliente de Axios al cargarse: se simula Axios y se importa
// después de definir la URL.
function loadApi(url = `${API_URL}/`) {
  jest.resetModules();
  if (url === null) {
    delete process.env.EXPO_PUBLIC_API_URL;
  } else {
    process.env.EXPO_PUBLIC_API_URL = url;
  }
  const request = jest.fn();
  const create = jest.fn(() => ({ request }));
  jest.doMock("axios", () => ({ __esModule: true, default: { create } }));
  return { ...require("../services/api"), request, create };
}

async function captureError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Se esperaba un error y la petición terminó bien");
}

describe("apiRequest", () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;

  afterAll(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
    jest.dontMock("axios");
  });

  describe("peticiones correctas", () => {
    it("crea el cliente de Axios con la URL sin barra final y devuelve los datos", async () => {
      const { apiRequest, request, create } = loadApi();
      request.mockResolvedValue(ok(200, [{ id: 1 }]));

      const result = await apiRequest("/products", { token: "abc" });

      expect(result).toEqual([{ id: 1 }]);
      expect(create).toHaveBeenCalledWith({ baseURL: API_URL });
      expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: "/products", method: "GET" }));
    });

    it("envía el token como Bearer", async () => {
      const { apiRequest, request } = loadApi();
      request.mockResolvedValue(ok(200, []));

      await apiRequest("/products", { token: "abc" });

      expect(request.mock.calls[0][0].headers).toEqual({ Authorization: "Bearer abc" });
    });

    it("envía el cuerpo como objeto, y sin Authorization si no hay token", async () => {
      const { apiRequest, request } = loadApi();
      request.mockResolvedValue(ok(200, { token: "t" }));

      await apiRequest("/login", { method: "POST", data: { email: "a@b.com", password: "x" } });

      expect(request).toHaveBeenCalledWith({
        url: "/login",
        method: "POST",
        data: { email: "a@b.com", password: "x" },
        headers: undefined,
      });
    });

    it("devuelve null cuando la respuesta no tiene cuerpo (204)", async () => {
      const { apiRequest, request } = loadApi();
      request.mockResolvedValue(ok(204, ""));

      await expect(apiRequest("/products/1", { method: "DELETE", token: "abc" })).resolves.toBeNull();
    });
  });

  describe("errores", () => {
    it("400 de validación: une los mensajes de cada campo", async () => {
      const { apiRequest, request } = loadApi();
      request.mockRejectedValue(httpError(400, {
        error: "Datos de entrada inválidos o faltantes",
        details: { name: "El nombre es obligatorio", quantity: "La cantidad no puede ser negativa" },
      }));

      const error = await captureError(apiRequest("/products", { method: "POST", token: "abc", data: {} }));

      expect(error.status).toBe(400);
      expect(error.message).toBe("El nombre es obligatorio La cantidad no puede ser negativa");
    });

    it("400 sin detalle: usa el mensaje del servidor", async () => {
      const { apiRequest, request } = loadApi();
      request.mockRejectedValue(httpError(400, { error: "La fecha enviada no coincide con la fecha actual" }));

      const error = await captureError(apiRequest("/products/stats?today=2020-01-01", { token: "abc" }));

      expect(error.message).toBe("La fecha enviada no coincide con la fecha actual");
    });

    it("401 sin token (login): muestra el motivo del servidor y no es sesión vencida", async () => {
      const { apiRequest, isSessionExpired, request } = loadApi();
      request.mockRejectedValue(httpError(401, { error: "Email o contraseña incorrectos" }));

      const error = await captureError(apiRequest("/login", { method: "POST", data: {} }));

      expect(error.status).toBe(401);
      expect(error.message).toBe("Email o contraseña incorrectos");
      expect(isSessionExpired(error)).toBe(false);
    });

    it("401 con token: es sesión vencida", async () => {
      const { apiRequest, isSessionExpired, SESSION_EXPIRED_MESSAGE, request } = loadApi();
      request.mockRejectedValue(httpError(401, { error: "Token expirado" }));

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.status).toBe(401);
      expect(error.message).toBe(SESSION_EXPIRED_MESSAGE);
      expect(isSessionExpired(error)).toBe(true);
    });

    it("404: el producto ya no existe", async () => {
      const { apiRequest, isSessionExpired, request } = loadApi();
      request.mockRejectedValue(httpError(404, { error: "Producto no encontrado" }));

      const error = await captureError(apiRequest("/products/9", { token: "abc" }));

      expect(error.status).toBe(404);
      expect(error.message).toBe("El producto ya no existe.");
      expect(isSessionExpired(error)).toBe(false);
    });

    it("409: el email ya está registrado", async () => {
      const { apiRequest, request } = loadApi();
      request.mockRejectedValue(httpError(409, { error: "El email ya se encuentra registrado" }));

      const error = await captureError(apiRequest("/register", { method: "POST", data: {} }));

      expect(error.status).toBe(409);
      expect(error.message).toBe("Ya existe una cuenta con ese email.");
    });

    it("500: servidor no disponible, aunque el cuerpo no sea JSON", async () => {
      const { apiRequest, request } = loadApi();
      request.mockRejectedValue(httpError(500, "<html>Error</html>"));

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.status).toBe(500);
      expect(error.message).toBe("El servidor no está disponible en este momento.");
    });

    it("error de conexión: estado 0 y mensaje claro", async () => {
      const { apiRequest, isSessionExpired, request } = loadApi();
      request.mockRejectedValue(new Error("Network Error"));

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.status).toBe(0);
      expect(error.message).toBe("No se pudo conectar con el servidor.");
      expect(isSessionExpired(error)).toBe(false);
    });

    it("sin URL configurada: avisa sin llamar al servidor", async () => {
      const { apiRequest, request } = loadApi(null);

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.message).toBe("No está configurada la URL del servidor.");
      expect(request).not.toHaveBeenCalled();
    });
  });
});
