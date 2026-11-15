const STORAGE_KEY = "gimpro.preferences.v1";

export const DEFAULT_PREFERENCES = Object.freeze({
  durationMinutes: 10,
  focus: "surprise",
  mode: "solo",
  sound: false
});

export function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return { ...DEFAULT_PREFERENCES, ...(stored ?? {}) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/** @param {Partial<typeof DEFAULT_PREFERENCES>} changes */
export function savePreferences(changes) {
  const preferences = { ...loadPreferences(), ...changes };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  return preferences;
}
