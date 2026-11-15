import { openDB } from "idb";

export const DB_NAME = "gimpro";
export const DB_VERSION = 1;

let databasePromise;

export function getDatabase() {
  databasePromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("sessions")) {
        const sessions = database.createObjectStore("sessions", { keyPath: "id" });
        sessions.createIndex("status", "status");
        sessions.createIndex("started_at", "started_at");
      }

      if (!database.objectStoreNames.contains("training_events")) {
        const events = database.createObjectStore("training_events", { keyPath: "id" });
        events.createIndex("session_id", "session_id");
        events.createIndex("exercise_id", "exercise_id");
        events.createIndex("started_at", "started_at");
      }
    }
  });
  return databasePromise;
}

/** @param {Object} session */
export async function saveSession(session) {
  const database = await getDatabase();
  await database.put("sessions", session);
  return session;
}

/** @param {Object} event */
export async function saveTrainingEvent(event) {
  const database = await getDatabase();
  await database.put("training_events", event);
  return event;
}

export async function listSessions() {
  const database = await getDatabase();
  const sessions = await database.getAll("sessions");
  return sessions.sort((left, right) =>
    String(right.started_at ?? "").localeCompare(String(left.started_at ?? ""))
  );
}

export async function listTrainingEvents() {
  const database = await getDatabase();
  const events = await database.getAll("training_events");
  return events.sort((left, right) =>
    String(right.started_at ?? "").localeCompare(String(left.started_at ?? ""))
  );
}

/** @param {string} sessionId */
export async function listEventsForSession(sessionId) {
  const database = await getDatabase();
  return database.getAllFromIndex("training_events", "session_id", sessionId);
}

export async function clearDatabaseForTests() {
  const database = await getDatabase();
  const transaction = database.transaction(["sessions", "training_events"], "readwrite");
  await Promise.all([
    transaction.objectStore("sessions").clear(),
    transaction.objectStore("training_events").clear(),
    transaction.done
  ]);
}
