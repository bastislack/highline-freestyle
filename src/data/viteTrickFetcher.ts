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
import { YamlTrickTableSchemaZod } from "./viteSchemaGenerator";
import buildGraph from "./variationOfCycleChecker";

async function fetchYamlFile(path: string) {
  const asObject = YamlTrickTableSchemaZod.parse(parse(await readFile(path, "utf8")))
  // This turns the "simple" IDs found in the YAMLs into the Key Tuples of the Tricks (e.g. [3,2] => [ [3, "official"], [2, "official"]])
  if(asObject.recommendedPrerequisites) {
    // cast as any is fine as we parse the object before returning with Zod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asObject.recommendedPrerequisites = asObject.recommendedPrerequisites.map( prerequisiteId => ([prerequisiteId, "official"])) as any
  }
  // same thing as above, just with the variationOf Entries.
  if(asObject.variationOf) {
    // cast as any is fine as we parse the object before returning with Zod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asObject.variationOf = asObject.variationOf.map( variationId => ([variationId, "official"])) as any
    
  }
  // Makes sure the YAML has the right structure. 
  return DbTricksTableZod.parse({...asObject, trickStatus: "official"})
}


function findDuplicateKeys(allTricks: z.infer<typeof DbTricksTableZod>[]) {

  const idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = createRecordLookup(allTricks);

  return Object.entries(idToTrickLookup).filter(([_,trickList]) => trickList.length > 1).map(([id,trickList]) => ({
    id,
    technicalNames: trickList.map( trick => trick.technicalName)
  }))

}


function createRecordLookup(allTricks: z.infer<typeof DbTricksTableZod>[]) {
  const idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = {};

  allTricks.forEach(trick => {
    if (!idToTrickLookup[trick.id]) {
      idToTrickLookup[trick.id] = [];
    }
      idToTrickLookup[trick.id].push(trick);
    });
  return idToTrickLookup;
}

/**
 * Tricks contain two types of References: 
 * - recommendedPrerequisites
 * - variationOf
 */
function findUndefinedReferences(allTricks: z.infer<typeof DbTricksTableZod>[]) {
  
  const idToTrickLookup: Record<number, (z.infer<typeof DbTricksTableZod>)[]> = createRecordLookup(allTricks);

  // issues define the ID of the Trick and an issue message
  const issues: [number, string][] = []

  allTricks.forEach( trick => {
    if(trick.recommendedPrerequisites) {
      trick.recommendedPrerequisites.forEach( (prerequisitePrimaryKey,i) => {
        if(prerequisitePrimaryKey[1] !== "official") {
          issues.push([trick.id, `All recommendedPrerequisites must limit themselves to official tricks (not the case for ${i+1}. Entry)`])
        }
        else if(!idToTrickLookup[prerequisitePrimaryKey[0]]) {
          issues.push([trick.id, `${i+1}. Entry in recommendedPrerequisites references an ID that does not exist (id: ${prerequisitePrimaryKey[0]}).`])
        }
        else if(prerequisitePrimaryKey[0] == trick.id) {
          issues.push([trick.id, `${i+1}. Entry in recommendedPrerequisites references itself (id: ${prerequisitePrimaryKey[0]}).`])
        }

      })
    }
    if(trick.variationOf) {
      trick.variationOf.forEach( (variationPrimaryKey,i) => {
        if(variationPrimaryKey[1] !== "official") {
          issues.push([trick.id, `All variationOf-Entries must limit themselves to official tricks (not the case for ${i+1}. Entry)`])
        }
        else if(!idToTrickLookup[variationPrimaryKey[0]]) {
          issues.push([trick.id, `${i+1}. Entry in variationOf references an ID that does not exist (id: ${variationPrimaryKey[0]}).`])
        }
        else if(variationPrimaryKey[0] == trick.id) {
          issues.push([trick.id, `${i+1}. Entry in variationOf references itself (id: ${variationPrimaryKey[0]}).`])
        }
      })
    }
  })

  return issues;
}



export default async function viteGetAllTricks() {
  // @ts-expect-error Because there are effectively two TS Projects (Vite Plugin Context 
  //and Vue Webapp Context), TS gets a bit confused and doesn't think import.meta.url is allowed here
  const pattern = join(fileURLToPath(import.meta.url), "..", "tricks", "*.yaml");
  const allFilePaths = await globby(pattern)

  const parsedYamlFiles = await Promise.allSettled(allFilePaths.map( trickFilePath => fetchYamlFile(trickFilePath)))
  const erroredFiles = parsedYamlFiles.map( (trickYamlFile,i) => trickYamlFile.status === "rejected" ? ({error: trickYamlFile.reason, path: allFilePaths[i]}) : (undefined as never) ).filter(Boolean);
  const goodFiles = parsedYamlFiles.map( trickYamlFile => trickYamlFile.status === "fulfilled" ? trickYamlFile.value : (undefined as never)).filter(Boolean)

  if(erroredFiles.length > 0) {

    const errorMeta = erroredFiles.map(errorResult => {
      if(!(errorResult.error instanceof ZodError)) {
        return String(errorResult.error)
      }
      return errorResult.path+"\n"+errorResult.error.errors.map( error => `${error.path}: ${error.message}`).join("\n")
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

  try {
    buildGraph(goodFiles)
  }
  catch(err) {
    throw {
      plugin: "vite-plugin-highline-freestyle-data",
      message: err
    }
  }

  return goodFiles
}