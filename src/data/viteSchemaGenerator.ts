/**
 * As part of startup, a Json Schema file is generated based on the Zod Type for both Combos and Tricks.
 * This is done so that the IDE can give errors on bad schemas.
 */


import {zodToJsonSchema} from "zod-to-json-schema"
import { DbTricksTableZod, DbCombosTableZod } from "../lib/database/schemas/CurrentVersionSchema"
import { writeFile } from "fs/promises"
import { join } from "path"
import { fileURLToPath } from "url"

export default async function generateJsonSchemas() {
  // trick/comboStatus is redundant, as it will always be `official`.
  const trickTableSchema = zodToJsonSchema(DbTricksTableZod.omit({trickStatus: true}),{name: "tricks"})
  const comboTableSchema = zodToJsonSchema(DbCombosTableZod.omit({comboStatus: true}), {name: "combos"})
  
  await writeFile(join(fileURLToPath(import.meta.url), "..", "tricks", "tricks.schema.json"),JSON.stringify(trickTableSchema), "utf8")
  await writeFile(join(fileURLToPath(import.meta.url), "..", "combos", "combos.schema.json"),JSON.stringify(comboTableSchema), "utf8")
}