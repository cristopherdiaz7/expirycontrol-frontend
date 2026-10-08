const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86400000;

function pad(value) {
  return String(value).padStart(2, "0");
}

// Fecha local del dispositivo en formato AAAA-MM-DD.
export function getLocalToday() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Convierte AAAA-MM-DD en sus partes, o null si no es una fecha real del calendario.
function parseDateParts(value) {
  const match = DATE_PATTERN.exec(value || "");
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return { year, month, day };
}

export function isValidDateString(value) {
  return parseDateParts(value) !== null;
}

// Días entre hoy (fecha local) y la fecha indicada. Negativo si ya pasó.
export function daysUntil(dateString, todayString = getLocalToday()) {
  const target = parseDateParts(dateString);
  const today = parseDateParts(todayString);
  if (!target || !today) return null;

  const targetTime = Date.UTC(target.year, target.month - 1, target.day);
  const todayTime = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((targetTime - todayTime) / MS_PER_DAY);
}
