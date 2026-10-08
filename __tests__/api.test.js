const API_URL = "http://localhost:8080";

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body)),
  };
}

// api.js lee la URL al cargarse, así que se importa después de definirla.
function loadApi(url = `${API_URL}/`) {
  jest.resetModules();
  if (url === null) {
    delete process.env.EXPO_PUBLIC_API_URL;
  } else {
    process.env.EXPO_PUBLIC_API_URL = url;
  }
  return require("../services/api");
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

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  });

  describe("peticiones correctas", () => {
    it("arma la URL sin barra duplicada y devuelve el JSON", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(200, [{ id: 1 }]));

      const result = await apiRequest("/products", { token: "abc" });

      expect(result).toEqual([{ id: 1 }]);
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/products`, expect.any(Object));
    });

    it("envía el token como Bearer", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(200, []));

      await apiRequest("/products", { token: "abc" });

      expect(global.fetch.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer abc" });
    });

    it("envía Content-Type solo cuando hay cuerpo, y sin Authorization si no hay token", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(200, { token: "t" }));

      await apiRequest("/login", { method: "POST", body: "{}" });

      expect(global.fetch.mock.calls[0][1].headers).toEqual({ "Content-Type": "application/json" });
    });

    it("devuelve null cuando la respuesta no tiene cuerpo (204)", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(204));

      await expect(apiRequest("/products/1", { method: "DELETE", token: "abc" })).resolves.toBeNull();
    });
  });

  describe("errores", () => {
    it("400 de validación: une los mensajes de cada campo", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(400, {
        error: "Datos de entrada inválidos o faltantes",
        details: { name: "El nombre es obligatorio", quantity: "La cantidad no puede ser negativa" },
      }));

      const error = await captureError(apiRequest("/products", { method: "POST", token: "abc", body: "{}" }));

      expect(error.status).toBe(400);
      expect(error.message).toBe("El nombre es obligatorio La cantidad no puede ser negativa");
    });

    it("400 sin detalle: usa el mensaje del servidor", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(400, { error: "La fecha enviada no coincide con la fecha actual" }));

      const error = await captureError(apiRequest("/products/stats?today=2020-01-01", { token: "abc" }));

      expect(error.message).toBe("La fecha enviada no coincide con la fecha actual");
    });

    it("401 sin token (login): muestra el motivo del servidor y no es sesión vencida", async () => {
      const { apiRequest, isSessionExpired } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(401, { error: "Email o contraseña incorrectos" }));

      const error = await captureError(apiRequest("/login", { method: "POST", body: "{}" }));

      expect(error.status).toBe(401);
      expect(error.message).toBe("Email o contraseña incorrectos");
      expect(isSessionExpired(error)).toBe(false);
    });

    it("401 con token: es sesión vencida", async () => {
      const { apiRequest, isSessionExpired, SESSION_EXPIRED_MESSAGE } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(401, { error: "Token expirado" }));

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.status).toBe(401);
      expect(error.message).toBe(SESSION_EXPIRED_MESSAGE);
      expect(isSessionExpired(error)).toBe(true);
    });

    it("404: el producto ya no existe", async () => {
      const { apiRequest, isSessionExpired } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(404, { error: "Producto no encontrado" }));

      const error = await captureError(apiRequest("/products/9", { token: "abc" }));

      expect(error.status).toBe(404);
      expect(error.message).toBe("El producto ya no existe.");
      expect(isSessionExpired(error)).toBe(false);
    });

    it("409: el email ya está registrado", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(409, { error: "El email ya se encuentra registrado" }));

      const error = await captureError(apiRequest("/register", { method: "POST", body: "{}" }));

      expect(error.status).toBe(409);
      expect(error.message).toBe("Ya existe una cuenta con ese email.");
    });

    it("500: servidor no disponible, aunque el cuerpo no sea JSON", async () => {
      const { apiRequest } = loadApi();
      global.fetch.mockResolvedValue(mockResponse(500, "<html>Error</html>"));

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.status).toBe(500);
      expect(error.message).toBe("El servidor no está disponible en este momento.");
    });

    it("error de conexión: estado 0 y mensaje claro", async () => {
      const { apiRequest, isSessionExpired } = loadApi();
      global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.status).toBe(0);
      expect(error.message).toBe("No se pudo conectar con el servidor.");
      expect(isSessionExpired(error)).toBe(false);
    });

    it("sin URL configurada: avisa sin llamar al servidor", async () => {
      const { apiRequest } = loadApi(null);

      const error = await captureError(apiRequest("/products", { token: "abc" }));

      expect(error.message).toBe("No está configurada la URL del servidor.");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
