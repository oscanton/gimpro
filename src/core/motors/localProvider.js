import spanishCatalog from "../../../data/motors/es.json";

export const MOTOR_TYPES = Object.freeze([
  "title",
  "phrase",
  "place",
  "character",
  "situation",
  "relationship",
  "word",
  "object",
  "style"
]);

export const AUTOMATIC_MOTOR_TYPES = Object.freeze(
  MOTOR_TYPES.filter((type) => type !== "style")
);

const DEFAULT_RARITY_WEIGHTS = Object.freeze([0.12, 0.18, 0.27, 0.28, 0.15]);
const HISTORY_WINDOWS = Object.freeze([40, 20, 10, 5, 2, 1, 0]);

/**
 * Contrato del proveedor local. Un proveedor remoto futuro puede implementar
 * el mismo método asíncrono sin modificar a sus consumidores.
 * @param {Object=} options
 * @param {Object=} options.catalog
 * @param {() => number=} options.random
 * @param {() => string=} options.idFactory
 */
export function createLocalMotorProvider({
  catalog = spanishCatalog,
  random = Math.random,
  idFactory = defaultIdFactory
} = {}) {
  validateCatalog(catalog);

  return Object.freeze({
    locale: catalog.locale,
    contentVersion: catalog.content_version,

    /**
     * @param {Object=} request
     * @param {string[]=} request.types
     * @param {string=} request.locale
     * @param {number|{min:number,max:number}=} request.rarity
     * @param {1|2=} request.count
     * @param {Array<Object>=} request.history
     * @returns {Promise<Array<Object>>}
     */
    async generate(request = {}) {
      const normalized = normalizeRequest(request, catalog.locale);
      const workingHistory = [...normalized.history];
      const results = [];

      for (let index = 0; index < normalized.count; index += 1) {
        const rarity = chooseRarity(normalized.rarity, random);
        const candidates = buildCandidates({
          catalog,
          types: normalized.types,
          rarity,
          random
        });
        const candidate = chooseCandidate(candidates, workingHistory, random);
        if (!candidate) throw new Error("MOTOR_CATALOG_EMPTY");

        const result = Object.freeze({
          id: `motor:${catalog.content_version}:${idFactory()}`,
          type: candidate.type,
          text: candidate.text,
          locale: catalog.locale,
          rarity,
          source: candidate.source,
          recipeId: candidate.recipeId,
          tags: Object.freeze([...candidate.tags]),
          parts: Object.freeze([...candidate.parts]),
          contentVersion: catalog.content_version
        });
        results.push(result);
        workingHistory.unshift(result);
      }

      return results;
    }
  });
}

function normalizeRequest(request, locale) {
  if ((request.locale ?? locale) !== locale) throw new Error("MOTOR_LOCALE_UNAVAILABLE");
  const count = request.count ?? 1;
  if (![1, 2].includes(count)) throw new RangeError("MOTOR_COUNT_OUT_OF_RANGE");

  const types = request.types?.length ? [...new Set(request.types)] : [...AUTOMATIC_MOTOR_TYPES];
  if (types.some((type) => !MOTOR_TYPES.includes(type))) {
    throw new RangeError("MOTOR_TYPE_UNKNOWN");
  }

  const rarity = normalizeRarity(request.rarity);
  return { count, types, rarity, history: Array.isArray(request.history) ? request.history : [] };
}

function normalizeRarity(rarity) {
  if (rarity === undefined) return { min: 0, max: 4, weighted: true };
  if (Number.isInteger(rarity) && rarity >= 0 && rarity <= 4) {
    return { min: rarity, max: rarity, weighted: false };
  }
  if (
    rarity && Number.isInteger(rarity.min) && Number.isInteger(rarity.max) &&
    rarity.min >= 0 && rarity.max <= 4 && rarity.min <= rarity.max
  ) {
    return { min: rarity.min, max: rarity.max, weighted: true };
  }
  throw new RangeError("MOTOR_RARITY_OUT_OF_RANGE");
}

function chooseRarity(range, random) {
  if (range.min === range.max) return range.min;
  const values = [];
  const weights = [];
  for (let rarity = range.min; rarity <= range.max; rarity += 1) {
    values.push(rarity);
    weights.push(range.weighted ? DEFAULT_RARITY_WEIGHTS[rarity] : 1);
  }
  return values[weightedIndex(weights, random)];
}

function buildCandidates({ catalog, types, rarity, random }) {
  const candidates = catalog.curated
    .filter((entry) => types.includes(entry.type) && entry.rarity === rarity)
    .map((entry) => ({
      type: entry.type,
      text: entry.text.trim(),
      source: "curated",
      recipeId: `curated.${entry.id}`,
      tags: entry.tags,
      parts: entry.parts,
      weight: entry.weight ?? 1
    }));

  for (const recipe of catalog.recipes) {
    if (
      !types.includes(recipe.type) || rarity < recipe.rarity_min ||
      rarity > recipe.rarity_max
    ) continue;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const generated = realizeRecipe(recipe, catalog.pieces, rarity, random);
      if (generated) candidates.push(generated);
    }
  }

  const unique = new Map();
  for (const candidate of candidates) {
    if (!candidate.text) continue;
    const key = `${candidate.type}:${normalizeText(candidate.text)}`;
    if (!unique.has(key)) unique.set(key, candidate);
  }
  return [...unique.values()];
}

function realizeRecipe(recipe, pieceCatalog, rarity, random) {
  let text = recipe.template;
  const tags = new Set(recipe.tags);
  const parts = [];

  for (const [token, collectionName] of Object.entries(recipe.slots)) {
    const pieces = pieceCatalog[collectionName] ?? [];
    const compatible = pieces.filter(
      (piece) => rarity >= piece.rarity_min && rarity <= piece.rarity_max
    );
    if (compatible.length === 0) return null;
    const piece = compatible[Math.floor(random() * compatible.length)];
    text = text.replaceAll(`{${token}}`, piece.text);
    parts.push(piece.id);
    for (const tag of piece.tags) tags.add(tag);
  }

  return {
    type: recipe.type,
    text: text.trim(),
    source: "procedural",
    recipeId: recipe.id,
    tags: [...tags],
    parts,
    weight: recipe.weight
  };
}

function chooseCandidate(candidates, history, random) {
  if (candidates.length === 0) return null;
  let available = candidates;
  for (const windowSize of HISTORY_WINDOWS) {
    const excludedTexts = new Set(
      history.slice(0, windowSize).map((item) => normalizeText(item.text ?? ""))
    );
    available = candidates.filter((candidate) => !excludedTexts.has(normalizeText(candidate.text)));
    if (available.length > 0) break;
  }

  const weights = available.map((candidate) => candidateWeight(candidate, history));
  return available[weightedIndex(weights, random)];
}

function candidateWeight(candidate, history) {
  let weight = Math.max(0.01, candidate.weight ?? 1);
  const recent = history.slice(0, 12);
  const recipeUses = recent.filter((item) => item.recipeId === candidate.recipeId).length;
  weight *= 0.45 ** recipeUses;

  const families = candidate.tags.filter((tag) => tag.startsWith("family:"));
  for (const family of families) {
    const uses = recent.filter((item) => item.tags?.includes(family)).length;
    weight *= 0.55 ** uses;
  }
  return Math.max(0.0001, weight);
}

function weightedIndex(weights, random) {
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (total <= 0) return Math.floor(random() * weights.length);
  let cursor = random() * total;
  for (let index = 0; index < weights.length; index += 1) {
    cursor -= Math.max(0, weights[index]);
    if (cursor <= 0) return index;
  }
  return weights.length - 1;
}

function validateCatalog(catalog) {
  if (!catalog || catalog.locale !== "es" || !Array.isArray(catalog.curated)) {
    throw new Error("MOTOR_CATALOG_INVALID");
  }
}

function normalizeText(value) {
  return String(value).trim().toLocaleLowerCase("es");
}

function defaultIdFactory() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
