import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearDatabaseForTests,
  listEventsForSession,
  listSessions,
  saveSession,
  saveTrainingEvent
} from "../../src/storage/db.js";

describe("almacenamiento local", () => {
  beforeEach(async () => {
    await clearDatabaseForTests();
  });

  it("guarda sesiones y eventos relacionados", async () => {
    await saveSession({ id: "session-1", status: "active", started_at: "2026-11-15T10:00:00Z" });
    await saveTrainingEvent({
      id: "event-1",
      session_id: "session-1",
      exercise_id: "ex-rebote-instantaneo",
      started_at: "2026-11-15T10:00:00Z"
    });

    expect(await listSessions()).toHaveLength(1);
    expect(await listEventsForSession("session-1")).toEqual([
      expect.objectContaining({ id: "event-1", session_id: "session-1" })
    ]);
  });
});
