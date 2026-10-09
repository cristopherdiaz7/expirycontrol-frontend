// Importes en pesos argentinos (ARS): punto para los miles y coma para los decimales.

const MAX_INTEGER_DIGITS = 10;

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function groupThousands(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 1234.5 -> "$ 1.234,50". Devuelve "Sin precio" si no hay valor.
export function formatARS(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "Sin precio";
  }

  const amount = Number(value);
  const [integerPart, decimalPart] = Math.abs(amount).toFixed(2).split(".");
  return `${amount < 0 ? "-" : ""}$ ${groupThousands(integerPart)},${decimalPart}`;
}

// Interpreta lo que escribe el usuario. Acepta coma o punto como separador decimal:
//   "1250,50" -> 1250.5     "1250.50" -> 1250.5     "1.250,50" -> 1250.5
//   "1.250"   -> 1250 (un punto seguido de tres dígitos es separador de miles)
// Devuelve null si el texto no es un importe válido.
export function parsePrice(text) {
  const clean = String(text ?? "").replace(/[\s$]/g, "");
  if (!clean || !/^[\d.,]+$/.test(clean)) return null;

  const lastComma = clean.lastIndexOf(",");
  const lastDot = clean.lastIndexOf(".");
  let integerPart = clean;
  let decimalPart = "";

  if (lastComma !== -1 && lastDot !== -1) {
    // Los dos separadores: el último es el decimal y el otro agrupa miles.
    const decimalIndex = Math.max(lastComma, lastDot);
    integerPart = clean.slice(0, decimalIndex);
    decimalPart = clean.slice(decimalIndex + 1);
  } else if (lastComma !== -1) {
    if (clean.indexOf(",") !== lastComma) return null;
    integerPart = clean.slice(0, lastComma);
    decimalPart = clean.slice(lastComma + 1);
  } else if (lastDot !== -1) {
    const groups = clean.split(".");
    const isThousands = groups.length > 2 || groups[1].length === 3;
    if (!isThousands) {
      integerPart = groups[0];
      decimalPart = groups[1];
    }
  }

  const digits = integerPart.replace(/[.,]/g, "");
  if (!/^\d+$/.test(digits) || !/^\d*$/.test(decimalPart)) return null;
  if (digits.length > MAX_INTEGER_DIGITS || decimalPart.length > 2) return null;

  return Number(`${digits}.${decimalPart || "0"}`);
}

// Mensaje de error para el campo de precio, o null si es válido.
export function getPriceError(text) {
  const clean = String(text ?? "").trim();
  if (!clean) return "Ingresa el precio unitario.";
  if (/-/.test(clean)) return "El precio no puede ser negativo.";
  if (parsePrice(clean) === null) return "Usa un importe válido con hasta dos decimales, por ejemplo 1250,50.";
  return null;
}

// Valor para precargar el campo al editar: 1250.5 -> "1250,50".
export function priceToInput(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toFixed(2).replace(".", ",");
}

// "2026-10" -> "Octubre 2026".
export function formatMonth(month) {
  const match = /^(\d{4})-(\d{2})$/.exec(month || "");
  if (!match) return month || "";
  const name = MONTH_NAMES[Number(match[2]) - 1];
  return name ? `${name} ${match[1]}` : month;
}
