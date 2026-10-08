import { daysUntil, getLocalToday, isValidDateString } from "../utils/dates";

describe("getLocalToday", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("devuelve la fecha local en formato AAAA-MM-DD", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 8, 12, 0));

    expect(getLocalToday()).toBe("2026-10-08");
  });

  it("usa el día local aunque falte poco para la medianoche", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 8, 23, 30));

    expect(getLocalToday()).toBe("2026-10-08");
  });

  it("completa con ceros el mes y el día", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 5, 9, 0));

    expect(getLocalToday()).toBe("2026-01-05");
  });
});

describe("isValidDateString", () => {
  it("acepta fechas reales con formato AAAA-MM-DD", () => {
    expect(isValidDateString("2026-10-08")).toBe(true);
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2026-12-31")).toBe(true);
  });

  it("rechaza fechas que no existen en el calendario", () => {
    expect(isValidDateString("2026-02-30")).toBe(false);
    expect(isValidDateString("2025-02-29")).toBe(false);
    expect(isValidDateString("2026-13-01")).toBe(false);
    expect(isValidDateString("2026-00-10")).toBe(false);
  });

  it("rechaza otros formatos y valores vacíos", () => {
    expect(isValidDateString("08-10-2026")).toBe(false);
    expect(isValidDateString("2026/10/08")).toBe(false);
    expect(isValidDateString("2026-1-8")).toBe(false);
    expect(isValidDateString("")).toBe(false);
    expect(isValidDateString(undefined)).toBe(false);
  });
});

describe("daysUntil", () => {
  it("devuelve 0 para hoy, positivo a futuro y negativo si ya pasó", () => {
    expect(daysUntil("2026-10-08", "2026-10-08")).toBe(0);
    expect(daysUntil("2026-10-09", "2026-10-08")).toBe(1);
    expect(daysUntil("2026-10-15", "2026-10-08")).toBe(7);
    expect(daysUntil("2026-10-07", "2026-10-08")).toBe(-1);
  });

  it("cuenta bien al cruzar de mes y de año", () => {
    expect(daysUntil("2026-11-01", "2026-10-31")).toBe(1);
    expect(daysUntil("2027-01-04", "2026-12-28")).toBe(7);
  });

  it("no se desfasa en los días de cambio de horario", () => {
    expect(daysUntil("2026-03-09", "2026-03-08")).toBe(1);
    expect(daysUntil("2026-11-02", "2026-11-01")).toBe(1);
  });

  it("usa la fecha local de hoy cuando no se indica", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 8, 23, 30));

    expect(daysUntil("2026-10-11")).toBe(3);

    jest.useRealTimers();
  });

  it("devuelve null si alguna fecha es inválida", () => {
    expect(daysUntil("no-es-fecha", "2026-10-08")).toBeNull();
    expect(daysUntil("2026-10-08", "2026-02-30")).toBeNull();
  });
});
