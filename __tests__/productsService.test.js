import { apiRequest } from "../services/api";
import {
  createProduct,
  deleteProduct,
  getExpiredProducts,
  getExpiringProducts,
  getProductStats,
  getProducts,
  updateProduct,
} from "../services/productsService";

jest.mock("../services/api", () => ({ apiRequest: jest.fn() }));

const TOKEN = "token-de-prueba";

describe("productsService", () => {
  beforeEach(() => {
    apiRequest.mockReset();
    // 23:30 local: en UTC-3 el servidor ya está en el día siguiente.
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 8, 23, 30));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("consultas con fecha local", () => {
    it("vencidos envía today", () => {
      getExpiredProducts(TOKEN);

      expect(apiRequest).toHaveBeenCalledWith("/products/expired?today=2026-10-08", { token: TOKEN });
    });

    it("por vencer envía days y today", () => {
      getExpiringProducts(TOKEN, 14);

      expect(apiRequest).toHaveBeenCalledWith("/products/expiring?days=14&today=2026-10-08", { token: TOKEN });
    });

    it("por vencer usa 7 días por defecto", () => {
      getExpiringProducts(TOKEN);

      expect(apiRequest).toHaveBeenCalledWith("/products/expiring?days=7&today=2026-10-08", { token: TOKEN });
    });

    it("estadísticas envía days y today", () => {
      getProductStats(TOKEN, 3);

      expect(apiRequest).toHaveBeenCalledWith("/products/stats?days=3&today=2026-10-08", { token: TOKEN });
    });
  });

  describe("CRUD", () => {
    const product = { name: "Leche", description: "Entera", category: "Lácteos", quantity: 2, expirationDate: "2026-10-20" };

    it("listar", () => {
      getProducts(TOKEN);

      expect(apiRequest).toHaveBeenCalledWith("/products", { token: TOKEN });
    });

    it("crear envía POST con el producto", () => {
      createProduct(TOKEN, product);

      expect(apiRequest).toHaveBeenCalledWith("/products", { method: "POST", token: TOKEN, body: JSON.stringify(product) });
    });

    it("actualizar envía PUT al id indicado", () => {
      updateProduct(TOKEN, 5, product);

      expect(apiRequest).toHaveBeenCalledWith("/products/5", { method: "PUT", token: TOKEN, body: JSON.stringify(product) });
    });

    it("eliminar envía DELETE al id indicado", () => {
      deleteProduct(TOKEN, 5);

      expect(apiRequest).toHaveBeenCalledWith("/products/5?today=2026-10-08", { method: "DELETE", token: TOKEN });
    });
  });
});
