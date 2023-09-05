/**
 * **WARNING** This module is expected to be invoked from a Vite Plugin!
 * 
 * Aggregated all YAML Files in the ./tricks Directory and creates a list 
 */


// unfortunately, vite features (e.g. import.meta.glob) are NOT available to plugin code.
// as such, we must fall back to reading YAMLs manually.
import {globby} from "globby"
import {join} from "path";
import {fileURLToPath} from "url"
import { ZodError, z } from "zod";
import { DbTricksTableZod } from "../lib/database/schemas/CurrentVersionSchema"
import {parse} from "yaml"
import { readFile } from "fs/promises";

async function fetchYamlFile(path: string): Promise<z.infer<typeof DbTricksTableZod>> {
  const asObject = parse(await readFile(path, "utf8"))
  // Makes sure the YAML has the right structure. 
  return DbTricksTableZod.parse({...asObject, trickStatus: "official"})
}


function findDuplicateKeys(allTricks: z.infer<typeof DbTricksTableZod>[]) {

  let idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = createRecordLookup(allTricks);

  return Object.entries(idToTrickLookup).filter(([_,e]) => e.length > 1).map(([k,v]) => ({
    id: k,
    technicalNames: v.map( e => e.technicalName)
  }))

}


function createRecordLookup(allTricks: z.infer<typeof DbTricksTableZod>[]) {
  let idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = {};

  allTricks.forEach(e => {
    if (!idToTrickLookup[e.id]) {
      idToTrickLookup[e.id] = [];
    }
      idToTrickLookup[e.id].push(e);
    });
  return idToTrickLookup;
}

/**
 * Tricks contain two types of References: 
 */
function findUndefinedReferences(allTricks: z.infer<typeof DbTricksTableZod>[]) {
  
  let idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = createRecordLookup(allTricks);

  // issues define the ID of the Trick and an issue message
  const issues: [number, string][] = []

  allTricks.forEach( e => {
    if(e.recommendedPrerequisites) {
      e.recommendedPrerequisites.map( (f,i) => {
        if(f[1] !== "official") {
          issues.push([e.id, `All recommendedPrerequisites must limit themselves to official tricks (not the case for ${i+1}. Entry)`])
        }
        else if(!idToTrickLookup[f[0]]) {
          issues.push([e.id, `${i+1}. Entry in recommendedPrerequisites references an ID that does not exist (id: ${f[0]}).`])
        }
        else if(f[0] == e.id) {
          issues.push([e.id, `${i+1}. Entry in recommendedPrerequisites references itself (id: ${f[0]}).`])
        }

      })
    }
    if(e.variationOf) {
      e.variationOf.map( (f,i) => {
        if(f[1] !== "official") {
          issues.push([e.id, `All variationOf-Entries must limit themselves to official tricks (not the case for ${i+1}. Entry)`])
        }
        else if(!idToTrickLookup[f[0]]) {
          issues.push([e.id, `${i+1}. Entry in variationOf references an ID that does not exist (id: ${f[0]}).`])
        }
        else if(f[0] == e.id) {
          issues.push([e.id, `${i+1}. Entry in variationOf references itself (id: ${f[0]}).`])
        }
      })
    }
  })

  return issues;
}



export default async function viteGetAllTricks() {
  // @ts-expect-error 
  const pattern = join(fileURLToPath(import.meta.url), "..", "tricks", "*.yaml");
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
      message: "At least one Trick file could not be parsed.\n\n"+errorMeta,
    }
  }

  const duplicateIds = findDuplicateKeys(goodFiles)
  if(duplicateIds.length > 0) {
    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: "Some Tricks contain the same ID.\n\n"+JSON.stringify(duplicateIds)
    }
  }

  const undefinedReferences = findUndefinedReferences(goodFiles)
  if(undefinedReferences.length > 0) {
    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: "Reference Resolution failed.\n\n"+undefinedReferences.map( e=> `Failed Trick: ${e[0]}. Issue: ${e[1]}`).join("\n")
    }
  }

  return goodFiles
}