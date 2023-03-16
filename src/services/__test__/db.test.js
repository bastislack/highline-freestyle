import Database from "../db.js";
import Dexie from "dexie";
import indexedDB from "fake-indexeddb";
import IDBKeyRange from "fake-indexeddb/lib/FDBKeyRange";

const getTestDb = () => new Database(() => new Dexie("db", {indexedDB: indexedDB, IDBKeyRange: IDBKeyRange}));

test("loads a predefined trick", async () => {
  const db = getTestDb();
  const result = await db.getTrick(10000);

  expect(result.technicalName).toBe("Panic Roll");
});

test("loads a predefined combo", async () => {
  const db = getTestDb();
  const result = await db.getCombo(10000);

  expect(result.name).toBe("Axel's standard combo end");
});
