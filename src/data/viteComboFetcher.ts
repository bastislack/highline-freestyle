/**
 * **WARNING** This module is expected to be invoked from a Vite Plugin!
 * 
 * Aggregated all YAML Files in the ./combos Directory and interpretes 
 */

import { parse } from "yaml"
import { DbCombosTableZod, DbTricksTableZod } from "../lib/database/schemas/CurrentVersionSchema"
import { readFile } from "node:fs/promises"
import { ZodError, z } from "zod"
import { globby } from "globby"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { YamlComboTableSchemaZod } from "./viteSchemaGenerator"

async function fetchYamlFile(path: string): Promise<z.infer<typeof DbCombosTableZod>> {
  const asObject = YamlComboTableSchemaZod.parse(parse(await readFile(path, "utf8")))

  if(!asObject.tricks) {
    throw new Error("Combos must contain at least one trick.")
  }

  asObject.tricks = asObject.tricks.map( e => ([e, "official"])) as any

  // Makes sure the YAML has the right structure. 
  return DbCombosTableZod.parse({...asObject, comboStatus: "official"})
}

function createRecordLookup<T extends z.infer<typeof DbCombosTableZod> | z.infer<typeof DbTricksTableZod>>(allEntities: T[]) {
  let idToComboLookup: Record<number, T[]> = {};

  allEntities.forEach(e => {
    if (!idToComboLookup[e.id]) {
      idToComboLookup[e.id] = [];
    }
      idToComboLookup[e.id].push(e);
    });
  return idToComboLookup;
}

function findDuplicateKeys(allCombos: z.infer<typeof DbCombosTableZod>[]) {

  let idToTrickLookup: Record<number, (z.infer<typeof DbCombosTableZod>)[]> = createRecordLookup(allCombos);

  return Object.entries(idToTrickLookup).filter(([_,e]) => e.length > 1).map(([k,v]) => ({
    id: k,
    technicalNames: v.map( e => e.technicalName)
  }))
}

function findUndefinedTrickReferences(allCombos: z.infer<typeof DbCombosTableZod>[], allTricks: z.infer<typeof DbTricksTableZod>[]) {
  
  let idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = createRecordLookup(allTricks);

  // issues define the ID of the Combo and an issue message
  const issues: [number, string][] = []

  allCombos.forEach( e => {
    if(e.tricks) {
      e.tricks.map( (f,i) => {
        if(f[1] !== "official") {
          issues.push([e.id, `All tricks must limit themselves to official ones (not the case for ${i+1}. Entry)`])
        }
        else if(!idToTrickLookup[f[0]]) {
          issues.push([e.id, `${i+1}. Entry in tricks references an ID that does not exist (id: ${f[0]}).`])
        }

      })
    }
  })

  return issues;
}





export default async function viteGetAllCombos(tricks: z.infer<typeof DbTricksTableZod>[]) {
  // @ts-expect-error 
  const pattern = join(fileURLToPath(import.meta.url), "..", "combos", "*.yaml");
  const allFilePaths = await globby(pattern)

  const parsedYamlFiles = await Promise.allSettled(allFilePaths.map( e => fetchYamlFile(e)))
  const erroredFiles = parsedYamlFiles.map( (e,i) => e.status === "rejected" ? ({error: e.reason, path: allFilePaths[i]}) : (undefined as never) ).filter( e => e);
  const goodFiles = parsedYamlFiles.map( e => e.status === "fulfilled" ? e.value : (undefined as never)).filter( e => e)

  if(erroredFiles.length) {

    const errorMeta = erroredFiles.map(e => {
      if(!(e.error instanceof ZodError)) {
        return e.error+""
      }
      return e.path+"\n"+e.error.errors.map( e => `${e.path}: ${e.message}`).join("\n")
    })

    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: "At least one Combo file could not be parsed.\n\n"+errorMeta,
    }
  }

  const duplicateIds = findDuplicateKeys(goodFiles)
  if(duplicateIds.length > 0) {
    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: "Some Combos contain the same ID.\n\n"+JSON.stringify(duplicateIds)
    }
  }

  const emptyCombos = goodFiles.filter(e => !e.tricks || e.tricks.length === 0).map( e => ([e.id, "Combo needs at least 1 trick"] as const))
  if(emptyCombos.length > 0) {
    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: "Empty Combos detected.\n\n"+emptyCombos.map( e=> `Failed Combo: ${e[0]}. Issue: ${e[1]}`).join("\n")
    }
  }

  const undefinedReferences = findUndefinedTrickReferences(goodFiles, tricks)
  if(undefinedReferences.length > 0) {
    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: "Reference Resolution failed.\n\n"+undefinedReferences.map( e=> `Failed Combo: ${e[0]}. Issue: ${e[1]}`).join("\n")
    }
  }

  return goodFiles
}