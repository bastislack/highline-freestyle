import type MainDatabase from "./mainDatabase";
import V4 from "./schemas/Version4Schema";
import V5 from "./schemas/Version5Schema";
import V6 from "./schemas/Version6Schema";
import V7 from "./schemas/Version7Schema";
import V8 from "./schemas/Version8Schema";

export function applyMigrations(db: MainDatabase) {
  db.version(4).stores(V4.schema);
  db.version(5).stores(V5.schema).upgrade(V5.upgrade);
  db.version(6).stores(V6.schema).upgrade(V6.upgrade);
  db.version(7).stores(V7.schema).upgrade(V7.upgrade);
  /// Any migrations above this point happened before the Migration to Typescript
  db.version(8).stores(V8.schema).upgrade(V8.upgrade);
}
