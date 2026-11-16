import { readFile } from "node:fs/promises";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("data/exercises.json", root), "utf8"));
const schema = JSON.parse(
  await readFile(new URL("data/schema/exercise.schema.json", root), "utf8")
);
const motorCatalog = JSON.parse(await readFile(new URL("data/motors/es.json", root), "utf8"));
const motorSchema = JSON.parse(
  await readFile(new URL("data/schema/motor-catalog.schema.json", root), "utf8")
);

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const validateMotors = ajv.compile(motorSchema);
const errors = [];

if (!validate(catalog)) {
  errors.push(...(validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`));
}

if (!validateMotors(motorCatalog)) {
  errors.push(
    ...(validateMotors.errors ?? []).map(
      (error) => `/motors${error.instancePath || "/"} ${error.message}`
    )
  );
}

for (const recipe of motorCatalog.recipes) {
  if (recipe.rarity_min > recipe.rarity_max) {
    errors.push(`${recipe.id}: rango de rareza invertido`);
  }
  for (const [token, collection] of Object.entries(recipe.slots)) {
    if (!motorCatalog.pieces[collection]) {
      errors.push(`${recipe.id}: colección desconocida ${collection}`);
    }
    if (!recipe.template.includes(`{${token}}`)) {
      errors.push(`${recipe.id}: el token ${token} no aparece en la plantilla`);
    }
  }
  const placeholders = [...recipe.template.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
  for (const placeholder of placeholders) {
    if (!recipe.slots[placeholder]) {
      errors.push(`${recipe.id}: el token ${placeholder} no tiene colección`);
    }
  }
}

for (const [collection, pieces] of Object.entries(motorCatalog.pieces)) {
  for (const piece of pieces) {
    if (piece.rarity_min > piece.rarity_max) {
      errors.push(`${collection}/${piece.id}: rango de rareza invertido`);
    }
  }
}

const knownSkills = new Set([
  "presence", "energy", "movement", "mime", "object_work", "space",
  "association", "spontaneity", "agility", "imagination", "attention", "memory",
  "character", "voice", "emotion", "status", "commitment",
  "listening", "acceptance", "offer", "bounce", "justification", "adaptation",
  "prol", "shared_reality", "conflict", "consequence", "escalation", "ending",
  "causality", "structure", "pattern", "callback", "point_of_view",
  "trust", "support", "complicity", "group_mind", "shared_focus"
]);

const ids = new Set();
const slugs = new Set();
const trainerCounts = new Map();
for (const exercise of catalog.exercises) {
  if (ids.has(exercise.id)) errors.push(`ID duplicado: ${exercise.id}`);
  if (slugs.has(exercise.slug)) errors.push(`Slug duplicado: ${exercise.slug}`);
  ids.add(exercise.id);
  slugs.add(exercise.slug);
  trainerCounts.set(exercise.trainer_id, (trainerCounts.get(exercise.trainer_id) ?? 0) + 1);

  for (const skill of [exercise.primary_skill, ...exercise.secondary_skills]) {
    if (!knownSkills.has(skill)) errors.push(`${exercise.id}: competencia desconocida ${skill}`);
  }

  const stepIds = exercise.progression_steps.map((step) => step.id);
  if (new Set(stepIds).size !== stepIds.length) {
    errors.push(`${exercise.id}: IDs de progresión duplicados`);
  }
  if (exercise.motor_policy?.rarity[0] > exercise.motor_policy?.rarity[1]) {
    errors.push(`${exercise.id}: rango de rareza de motores invertido`);
  }
}

for (let number = 1; number <= 10; number += 1) {
  const trainerId = `T${String(number).padStart(2, "0")}`;
  if (trainerCounts.get(trainerId) !== 2) {
    errors.push(`${trainerId}: se esperaban 2 ejercicios y hay ${trainerCounts.get(trainerId) ?? 0}`);
  }
}

if (errors.length > 0) {
  console.error("El catálogo no es válido:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Catálogos válidos: ${catalog.exercises.length} ejercicios y ` +
  `${motorCatalog.curated.length} motores curados (${motorCatalog.locale}).`
);
