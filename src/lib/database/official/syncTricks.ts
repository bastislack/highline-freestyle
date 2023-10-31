import { z } from "zod";
import { DbTricksTableZod } from "../schemas/CurrentVersionSchema";
import db from "../databaseInstance"

type DbTrick = z.infer<typeof DbTricksTableZod>


async function moveTrick(trickId: number, from: DbTrick["trickStatus"], to: DbTrick["trickStatus"]) {
  if(from === to) {
    return
  }

  // This is being run for all tricks that are to be deleted.
  // Dexie does not have a concept of "changing" the Primary Key of an object.
  // so we cannot "move" the official, to be deleted, tricks by simply telling Dexie to set the trickStatus to `archived`.
  // What we *can* do however is PUT new Tricks into the Table that have trickStatus set to archived and then delete the original trick.

  // First, make sure all references to this trick are changed to the archived counterpart.
  // Currently, external references can be found in:
  // - metadata
  // - recommendedPrequisites
  // - variationOf
  // - tricks belonging to a combo
  
  // Immediately invoked promises.
  // TODO: Extract into separate functions
  // One might consider running these in parallel, but there is the risk of a 
  // race condition / working on something that is currently being modified.
  // To keep things safe it is probably better to run those in sequence.

  const handleMetadata = async() => {
    const metadataResult = await db.metadata.get([trickId, from, "Trick"])
    if(!metadataResult) {
      return
    }
    // Metadata exists.
    // Compose new Metadata
    const newMetadata = {
      ...metadataResult,
      trickStatus: to
    }
    await db.metadata.put(newMetadata)
    // Then delete the old metadata
    await db.metadata.delete([trickId, from, "Trick"])
  }

  const handleRecommendedPrerequisites = async () => {
    await db.tricks.where("recommendedPrerequisites").equals([trickId, from]).modify( e => {
      if(!e.recommendedPrerequisites) {
        return
      }

      e.recommendedPrerequisites = e.recommendedPrerequisites.map( ([id, status]) => {
        if(id === trickId && status === from) {
          return [id, to]
        }
        return [id, status]
      } )
      
    })
  }

  const handleVariationOf = async () => {
    await db.tricks.where("variationOf").equals([trickId, from]).modify( e => {
      if(!e.variationOf) {
        return
      }

      e.variationOf = e.variationOf.map( ([id, status]) => {
        if(id === trickId && status === from) {
          return [id, to]
        }
        return [id, status]
      })
    })
  }

  const handleTrickReferences = async () => {
    await db.combos.where("tricks").equals([trickId, from]).modify( e => {
      e.tricks.map( ([id, status]) => {
        if(id === trickId && status === from) {
          return [id, to]
        }
        return [id, status]
      })
    })
  }


  try {
    await handleMetadata()
  }catch(err) {
    console.error(`[Official Sync] Failed to update metadata for ${trickId}`, err)
    
  }
  try {
    await handleRecommendedPrerequisites()
  }catch(err) {
    console.error(`[Official Sync] Failed to update recommended Prerequisites referencing ${trickId}`, err)
  }
  try {
    await handleVariationOf()
  }catch(err) {
    console.error(`[Official Sync] Failed to update variationOf referencing ${trickId}`, err)
  }
  try {
    await handleTrickReferences()
  }catch(err) {
    console.error(`[Official Sync] Failed to combos referencing trick ${trickId}`, err)
  }
}




async function handleArchiving(archivedTricks: z.infer<typeof DbTricksTableZod>[]) {
  const result = await Promise.allSettled(archivedTricks.map(async e => db.transaction("rw", [db.tricks, db.combos, db.metadata], async()=> {
    
    await moveTrick(e.id, "official", "archived")

    // At this point references are handled. Now we just need to move the actual Trick over.
    // This is done using a PUT and DELETE (because again, you cannot modify the Primary Key with Dexie / IndexedDB)
    const newTrickObject = DbTricksTableZod.parse({
      ...e,
      trickStatus: "archived"
    });

    await db.tricks.put(newTrickObject)
    await db.tricks.delete([e.id, "official"])
  })))

  const failedTrickMigrations = result.filter( e => e.status === "rejected").length

  if(failedTrickMigrations === 0) {
    console.info("All deleted official Tricks were archived successfully.")
  }
  else {
    console.error(`${failedTrickMigrations} Tricks have failed archiving.`)
  }

  return failedTrickMigrations === 0
}


/**
 * Although the odds of a trick that was archived being reintroduced are very, it might still be possible.
 * This will 
 * - find metadata belonging to an archived trick and move it to the official trick
 * - move any references to the archived trick back to the official trick
 * - delete the archived trick (creation will happen later)
 */
async function handleUnarchivingTricks(tricks: z.infer<typeof DbTricksTableZod>[]) {

  return await Promise.allSettled( tricks.map( async e => {
    await moveTrick(e.id, "archived", "official")
    // At this point references are handled. Now we just need to move the actual Trick over.
    // This is done using a PUT and DELETE (because again, you cannot modify the Primary Key with Dexie / IndexedDB)
    const newTrickObject = DbTricksTableZod.parse({
      ...e,
      trickStatus: "official"
    });

    // PUT'ting the new trick here technically is redundant, but its still here 
    // too keep consistent with the archiving procedure.
    await db.tricks.put(newTrickObject)
    await db.tricks.delete([e.id, "archived"])
  }))
}



export default async function syncTricks() {
  const tricks = z.array(DbTricksTableZod).parse((await import("virtual:highline-freestyle-data")).tricks);

  const idsOfNewTricksMap = Object.fromEntries(tricks.map(e => [e.id!, true] as const))

  const allCurrentofficialTricks = await db.tricks.where("[id+trickStatus]").between([0,"official"], [Infinity, "official"]).toArray()

  // These tricks get converted into "archived" tricks.
  const tricksThatHaveBeenRemoved =  allCurrentofficialTricks.filter(e => idsOfNewTricksMap[String(e.id)] !== true)

  if(tricksThatHaveBeenRemoved.length > 0) {
    await handleArchiving(tricksThatHaveBeenRemoved)
  }

  
  await handleUnarchivingTricks(tricks)

  // At this point, the Database should be in a state where all to-be-archived Tricks had their references updated.
  // so we can safely PUT the new tricks into the DB.
  await db.tricks.bulkPut(tricks)

}