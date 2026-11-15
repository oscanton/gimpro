import { describe, expect, it } from "vitest";
import { exercises } from "../../src/core/catalog.js";
import { buildSession } from "../../src/core/sessionBuilder.js";

describe("buildSession", () => {
  it("crea la misma sesión con la misma semilla", () => {
    const input = {
      durationMinutes: 10,
      focus: "mind",
      mode: "solo",
      catalog: exercises,
      seed: "estable"
    };
    expect(buildSession(input)).toEqual(buildSession(input));
  });

  it.each([
    [5, 1],
    [10, 2],
    [20, 3]
  ])("crea %i minutos con %i ejercicios dentro del presupuesto", (durationMinutes, count) => {
    const session = buildSession({
      durationMinutes,
      focus: "surprise",
      mode: "solo",
      catalog: exercises,
      seed: `duration-${durationMinutes}`
    });
    expect(session.exercises).toHaveLength(count);
    expect(session.planned_duration_seconds).toBeLessThanOrEqual(durationMinutes * 60 * 0.8);
  });

  it("incluye el foco elegido", () => {
    const session = buildSession({
      durationMinutes: 10,
      focus: "character",
      mode: "solo",
      catalog: exercises,
      seed: "character"
    });
    const selected = session.exercises.map((item) =>
      exercises.find((exercise) => exercise.id === item.exercise_id)
    );
    expect(selected.some((exercise) => exercise.training_area === "ACTOR")).toBe(true);
  });

  it("incluye integración escénica en sesiones de veinte minutos", () => {
    const session = buildSession({
      durationMinutes: 20,
      focus: "body",
      mode: "solo",
      catalog: exercises,
      seed: "integration"
    });
    const selected = session.exercises.map((item) =>
      exercises.find((exercise) => exercise.id === item.exercise_id)
    );
    expect(selected.some((exercise) => exercise.training_area === "SCENE")).toBe(true);
  });

  it("rechaza una duración no soportada", () => {
    expect(() =>
      buildSession({
        durationMinutes: 15,
        focus: "surprise",
        mode: "solo",
        catalog: exercises
      })
    ).toThrow(/duración/i);
  });
});
