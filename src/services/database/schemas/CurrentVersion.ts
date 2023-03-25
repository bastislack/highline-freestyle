/**
 * This Module is only used for Typescript.
 * Any consumer should import all types from here, NOT from VersionXSchema.ts
 *
 * As you can see this uses "export type" instead of just "export". This *should* get optimized away during compilation as no actual logic, just TS Interfaces, are being re-exported here.
 */

export type {
  UserTricksTable,
  UserCombosTable,
  PredefinedCombosTable,
  PredefinedTricksTable,
  VersionsTable,
} from "./Version8Schema";
