const STORAGE_KEY = "gimpro.motor-history.v1";
const HISTORY_LIMIT = 60;

export function loadMotorHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(history) ? history.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

/** @param {Array<Object>} motors */
export function rememberMotors(motors) {
  const current = loadMotorHistory();
  const combined = [...motors, ...current];
  const unique = combined.filter(
    (item, index) => combined.findIndex((candidate) => candidate.id === item.id) === index
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique.slice(0, HISTORY_LIMIT)));
  return unique.slice(0, HISTORY_LIMIT);
}

export function clearMotorHistoryForTests() {
  localStorage.removeItem(STORAGE_KEY);
}
