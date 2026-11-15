import catalog from "../../data/exercises.json";

export const CATALOG_VERSION = catalog.catalog_version;
export const exercises = Object.freeze(catalog.exercises);

const AREA_LABELS = {
  BODY: "Cuerpo",
  MIND: "Mente",
  ACTOR: "Personaje",
  IMPRO: "Impro",
  SCENE: "Escena",
  STORY: "Historia",
  GROUP: "Grupo"
};

/** @param {string} area */
export function areaLabel(area) {
  return AREA_LABELS[area] ?? area;
}

/** @param {string} id */
export function findExercise(id) {
  return exercises.find((exercise) => exercise.id === id) ?? null;
}
