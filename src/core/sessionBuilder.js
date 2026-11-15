import { hashString, mulberry32 } from "../utils/random.js";

const FOCUS_AREAS = {
  body: "BODY",
  mind: "MIND",
  character: "ACTOR",
  scene: "SCENE"
};

const SESSION_SIZE = { 5: 1, 10: 2, 20: 3 };

/**
 * @typedef {Object} TrainingHistoryItem
 * @property {string} exercise_id
 * @property {string=} primary_skill
 * @property {string=} started_at
 */

/**
 * Construye una sesión determinista a partir del catálogo.
 * @param {Object} input
 * @param {5|10|20} input.durationMinutes
 * @param {"surprise"|"body"|"mind"|"character"|"scene"} input.focus
 * @param {"solo"|"pair"|"group"} input.mode
 * @param {Array<Object>} input.catalog
 * @param {TrainingHistoryItem[]=} input.history
 * @param {string=} input.seed
 */
export function buildSession({
  durationMinutes,
  focus,
  mode,
  catalog,
  history = [],
  seed = `${durationMinutes}-${focus}-${mode}`
}) {
  const desiredCount = SESSION_SIZE[durationMinutes];
  if (!desiredCount) {
    throw new RangeError("La duración debe ser 5, 10 o 20 minutos.");
  }

  const budgetSeconds = Math.floor(durationMinutes * 60 * 0.8);
  const focusArea = FOCUS_AREAS[focus] ?? null;
  const recentIds = history.slice(-5).map((item) => item.exercise_id);
  const lastTwoIds = recentIds.slice(-2);
  const random = mulberry32(hashString(seed));

  const compatible = catalog.filter(
    (exercise) =>
      exercise.status === "published" &&
      exercise.modes.includes(mode) &&
      exercise.progression_steps.length >= 3 &&
      exercise.estimated_duration_seconds <= budgetSeconds
  );

  if (compatible.length < desiredCount) {
    throw new Error("No hay suficientes ejercicios compatibles para esta sesión.");
  }

  const scored = compatible.map((exercise) => {
    let score = 100;
    const reasons = [];

    if (focusArea && exercise.training_area === focusArea) {
      score += 30;
      reasons.push("coincide con el foco");
    }
    if (!recentIds.includes(exercise.id)) {
      score += 10;
      reasons.push("aporta variedad reciente");
    }
    if (lastTwoIds.includes(exercise.id)) {
      score -= 40;
    }

    score += random();
    return { exercise, score, reasons };
  });

  const combinations = combinationsOf(scored, desiredCount)
    .filter((combination) => totalDuration(combination) <= budgetSeconds)
    .filter(
      (combination) =>
        !focusArea || combination.some(({ exercise }) => exercise.training_area === focusArea)
    )
    .filter(
      (combination) =>
        durationMinutes !== 20 || combination.some(({ exercise }) => exercise.training_area === "SCENE")
    )
    .map((combination) => ({
      combination,
      score: scoreCombination(combination, durationMinutes)
    }))
    .sort((left, right) => right.score - left.score);

  const best = combinations[0]?.combination;
  if (!best) {
    throw new Error("No existe una combinación que cumpla el presupuesto y el foco.");
  }

  const ordered = orderForVariety(best);
  return {
    seed,
    duration_minutes: durationMinutes,
    planned_duration_seconds: totalDuration(ordered),
    focus,
    mode,
    exercises: ordered.map(({ exercise, reasons }, index) => ({
      order: index + 1,
      exercise_id: exercise.id,
      progression_step_id: exercise.progression_steps[0].id,
      planned_duration_seconds: exercise.estimated_duration_seconds,
      reasons: reasons.length > 0 ? reasons : ["compatible con tiempo y modalidad"]
    }))
  };
}

/** @param {Array<Object>} items @param {number} size */
function combinationsOf(items, size) {
  /** @type {Array<Array<Object>>} */
  const result = [];
  function visit(start, current) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let index = start; index < items.length; index += 1) {
      current.push(items[index]);
      visit(index + 1, current);
      current.pop();
    }
  }
  visit(0, []);
  return result;
}

/** @param {Array<Object>} selection */
function totalDuration(selection) {
  return selection.reduce(
    (total, item) => total + item.exercise.estimated_duration_seconds,
    0
  );
}

/** @param {Array<Object>} combination @param {number} durationMinutes */
function scoreCombination(combination, durationMinutes) {
  let score = combination.reduce((total, item) => total + item.score, 0);
  const skills = combination.map(({ exercise }) => exercise.primary_skill);
  score -= (skills.length - new Set(skills).size) * 25;

  const areas = combination.map(({ exercise }) => exercise.training_area);
  if (new Set(areas).size > 1) score += 10;
  if (durationMinutes === 20 && areas.includes("SCENE")) score += 20;
  return score;
}

/** @param {Array<Object>} selection */
function orderForVariety(selection) {
  const remaining = [...selection].sort((left, right) => right.score - left.score);
  const ordered = [remaining.shift()];

  while (remaining.length > 0) {
    const previousArea = ordered.at(-1).exercise.training_area;
    const differentArea = remaining.findIndex(
      ({ exercise }) => exercise.training_area !== previousArea
    );
    ordered.push(remaining.splice(differentArea >= 0 ? differentArea : 0, 1)[0]);
  }
  return ordered;
}
