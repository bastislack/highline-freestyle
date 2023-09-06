/**
 * As part of startup, a Json Schema file is generated based on the Zod Type for both Combos and Tricks.
 * This is done so that the IDE can give errors on bad schemas.
 */


import {zodToJsonSchema} from "zod-to-json-schema"
import { DbTricksTableZod, DbCombosTableZod } from "../lib/database/schemas/CurrentVersionSchema"
import { writeFile } from "fs/promises"
import { join } from "path"
import { fileURLToPath } from "url"
import { z } from "zod"

const ShortIdArray = z.array(z.number().int().min(0))

export const YamlTrickTableSchemaZod = DbTricksTableZod.omit({
  trickStatus: true, 
  recommendedPrerequisites: true, 
  variationOf: true
}).and(z.object({
  recommendedPrerequisites: ShortIdArray.optional(),
  variationOf: ShortIdArray.optional()
}));

export const YamlComboTableSchemaZod = DbCombosTableZod.omit({
  comboStatus: true, 
  tricks: true
}).and(z.object({
  tricks: ShortIdArray.nonempty()
}));


export default async function generateJsonSchemas() {
  // trick/comboStatus is redundant, as it will always be `official`.
  const trickTableSchema = zodToJsonSchema(YamlTrickTableSchemaZod,{name: "tricks"})
  const comboTableSchema = zodToJsonSchema(YamlComboTableSchemaZod, {name: "combos"})
  
  // @ts-expect-error For some weird reason this is interpreted as a CommonJS Module by the LSP.
  const thisFilePath = fileURLToPath(import.meta.url)

  await writeFile(join(thisFilePath, "..", "tricks", "tricks.schema.json"),JSON.stringify(trickTableSchema), "utf8")
  await writeFile(join(thisFilePath, "..", "combos", "combos.schema.json"),JSON.stringify(comboTableSchema), "utf8")
}