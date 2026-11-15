import { readFile } from "node:fs/promises";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("data/exercises.json", root), "utf8"));
const schema = JSON.parse(
  await readFile(new URL("data/schema/exercise.schema.json", root), "utf8")
);

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const errors = [];

if (!validate(catalog)) {
  errors.push(...(validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`));
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

console.log(`Catálogo válido: ${catalog.exercises.length} ejercicios, versión ${catalog.catalog_version}.`);
