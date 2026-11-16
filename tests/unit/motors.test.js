import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_MOTOR_TYPES,
  createLocalMotorProvider,
  MOTOR_TYPES
} from "../../src/core/motors/localProvider.js";

const TYPE_RARITY_CASES = MOTOR_TYPES.flatMap((type) =>
  [0, 1, 2, 3, 4].map((rarity) => [type, rarity])
);

function testProvider(options = {}) {
  let sequence = 0;
  return createLocalMotorProvider({
    random: () => 0.37,
    idFactory: () => `test-${sequence += 1}`,
    ...options
  });
}

describe("proveedor local de motores", () => {
  it.each(TYPE_RARITY_CASES)("genera %s con rareza %i", async (type, rarity) => {
    const [motor] = await testProvider().generate({ types: [type], rarity });
    expect(motor.type).toBe(type);
    expect(motor.rarity).toBe(rarity);
  });

  it.each([0, 1, 2, 3, 4])("respeta la rareza %i", async (rarity) => {
    const [motor] = await testProvider().generate({ rarity });
    expect(motor.rarity).toBe(rarity);
  });

  it.each([1, 2])("genera %i motores", async (count) => {
    const motors = await testProvider().generate({
      types: ["situation"],
      rarity: 3,
      count
    });
    expect(motors).toHaveLength(count);
  });

  it("excluye estilos de la generación automática", async () => {
    expect(AUTOMATIC_MOTOR_TYPES).not.toContain("style");
    const motors = await testProvider().generate({ count: 2 });
    expect(motors.every((motor) => motor.type !== "style")).toBe(true);
  });

  it("evita repetir un motor reciente cuando existen alternativas", async () => {
    const provider = testProvider();
    const [first] = await provider.generate({ types: ["word"], rarity: 0 });
    const [second] = await provider.generate({
      types: ["word"],
      rarity: 0,
      history: [first]
    });
    expect(second.text).not.toBe(first.text);
  });

  it("relaja el historial cuando se agota una categoría pequeña", async () => {
    const catalog = {
      locale: "es",
      content_version: "test",
      curated: [
        {
          id: "only.word",
          type: "word",
          text: "Dedal",
          rarity: 0,
          tags: ["concrete"],
          parts: ["dedal"]
        }
      ],
      pieces: {},
      recipes: []
    };
    const provider = testProvider({ catalog });
    const [motor] = await provider.generate({
      types: ["word"],
      rarity: 0,
      history: [{ text: "Dedal", tags: [], recipeId: "curated.only.word" }]
    });
    expect(motor.text).toBe("Dedal");
  });

  it("mantiene el contrato de salida estable", async () => {
    const [motor] = await testProvider().generate({ types: ["title"], rarity: 3 });
    expect(motor).toEqual({
      id: expect.stringMatching(/^motor:1\.0\.0:test-/),
      type: "title",
      text: expect.any(String),
      locale: "es",
      rarity: 3,
      source: expect.stringMatching(/^(curated|procedural)$/),
      recipeId: expect.any(String),
      tags: expect.any(Array),
      parts: expect.any(Array),
      contentVersion: "1.0.0"
    });
  });

  it("nunca produce salidas vacías", async () => {
    const provider = testProvider();
    const generated = [];
    for (const rarity of [0, 1, 2, 3, 4]) {
      generated.push(...await provider.generate({ rarity, count: 2, history: generated }));
    }
    expect(generated).toHaveLength(10);
    expect(generated.every((motor) => motor.text.trim().length > 0)).toBe(true);
  });
});
