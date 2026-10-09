import { apiRequest } from "../services/api";
import { getLossStats, getLosses } from "../services/lossesService";
import { formatARS, formatMonth, getPriceError, parsePrice, priceToInput } from "../utils/currency";

jest.mock("../services/api", () => ({ apiRequest: jest.fn() }));

describe("formatARS", () => {
  it("usa punto para los miles y coma para los decimales", () => {
    expect(formatARS(1234.56)).toBe("$ 1.234,56");
    expect(formatARS(1250.5)).toBe("$ 1.250,50");
    expect(formatARS(1234567.8)).toBe("$ 1.234.567,80");
  });

  it("siempre muestra dos decimales", () => {
    expect(formatARS(0)).toBe("$ 0,00");
    expect(formatARS(5)).toBe("$ 5,00");
    expect(formatARS(999.999)).toBe("$ 1.000,00");
  });

  it("acepta el importe como texto, tal como puede llegar del servidor", () => {
    expect(formatARS("3751.50")).toBe("$ 3.751,50");
  });

  it("indica cuando no hay precio", () => {
    expect(formatARS(null)).toBe("Sin precio");
    expect(formatARS(undefined)).toBe("Sin precio");
    expect(formatARS("")).toBe("Sin precio");
  });
});

describe("parsePrice", () => {
  it("acepta coma como separador decimal", () => {
    expect(parsePrice("1250,50")).toBe(1250.5);
    expect(parsePrice("0,5")).toBe(0.5);
  });

  it("acepta punto como separador decimal", () => {
    expect(parsePrice("1250.50")).toBe(1250.5);
    expect(parsePrice("12.5")).toBe(12.5);
  });

  it("acepta enteros", () => {
    expect(parsePrice("1500")).toBe(1500);
    expect(parsePrice("0")).toBe(0);
  });

  it("entiende el formato argentino con miles", () => {
    expect(parsePrice("1.250,50")).toBe(1250.5);
    expect(parsePrice("1.250")).toBe(1250);
    expect(parsePrice("1.234.567")).toBe(1234567);
    expect(parsePrice("$ 1.234,56")).toBe(1234.56);
  });

  it("entiende el formato con coma de miles y punto decimal", () => {
    expect(parsePrice("1,250.50")).toBe(1250.5);
  });

  it("rechaza más de dos decimales", () => {
    expect(parsePrice("10,999")).toBeNull();
    expect(parsePrice("10.9999")).toBeNull();
  });

  it("rechaza textos que no son importes", () => {
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("abc")).toBeNull();
    expect(parsePrice("-5")).toBeNull();
    expect(parsePrice("1,2,3")).toBeNull();
    expect(parsePrice(null)).toBeNull();
  });

  it("rechaza importes con más de 10 dígitos enteros", () => {
    expect(parsePrice("12345678901")).toBeNull();
    expect(parsePrice("1234567890")).toBe(1234567890);
  });
});

describe("getPriceError", () => {
  it("no devuelve error para importes válidos, incluido el cero", () => {
    expect(getPriceError("1250,50")).toBeNull();
    expect(getPriceError("0")).toBeNull();
  });

  it("pide el precio cuando está vacío", () => {
    expect(getPriceError("")).toBe("Ingresa el precio unitario.");
    expect(getPriceError("   ")).toBe("Ingresa el precio unitario.");
  });

  it("explica los demás errores", () => {
    expect(getPriceError("-5")).toBe("El precio no puede ser negativo.");
    expect(getPriceError("10,999")).toBe("Usa un importe válido con hasta dos decimales, por ejemplo 1250,50.");
  });
});

describe("priceToInput", () => {
  it("prepara el precio para editarlo, con coma decimal", () => {
    expect(priceToInput(1250.5)).toBe("1250,50");
    expect(priceToInput(0)).toBe("0,00");
  });

  it("deja el campo vacío si el producto no tiene precio", () => {
    expect(priceToInput(null)).toBe("");
    expect(priceToInput(undefined)).toBe("");
  });

  it("el valor precargado se vuelve a leer igual", () => {
    expect(parsePrice(priceToInput(3751.5))).toBe(3751.5);
  });
});

describe("formatMonth", () => {
  it("convierte AAAA-MM en nombre de mes y año", () => {
    expect(formatMonth("2026-10")).toBe("Octubre 2026");
    expect(formatMonth("2027-01")).toBe("Enero 2027");
  });

  it("devuelve el texto original si no tiene el formato esperado", () => {
    expect(formatMonth("octubre")).toBe("octubre");
    expect(formatMonth("2026-13")).toBe("2026-13");
  });
});

describe("lossesService", () => {
  const TOKEN = "token-de-prueba";

  beforeEach(() => {
    apiRequest.mockReset();
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 8, 23, 30));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("listar pérdidas envía today con la fecha local", () => {
    getLosses(TOKEN);

    expect(apiRequest).toHaveBeenCalledWith("/losses?today=2026-10-08", { token: TOKEN });
  });

  it("estadísticas envía today con la fecha local", () => {
    getLossStats(TOKEN);

    expect(apiRequest).toHaveBeenCalledWith("/losses/stats?today=2026-10-08", { token: TOKEN });
  });

  it("devuelve la respuesta del servidor", async () => {
    const response = { currency: "ARS", totalAmount: 100, lossCount: 1, unitsLost: 2, byMonth: [] };
    apiRequest.mockResolvedValue(response);

    await expect(getLossStats(TOKEN)).resolves.toBe(response);
  });
});
