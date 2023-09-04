import { z } from "zod";
import { DbCombosTableZod, DbTricksTableZod } from "../schemas/CurrentVersionSchema";
import db from "../databaseInstance"


async function handleArchiving(archivedTricks: z.infer<typeof DbTricksTableZod>[]) {
  const result = await Promise.allSettled(archivedTricks.map(async e => {
    // This is being run for all tricks that are to be deleted.
    // Dexie does not have a concept of "changing" the Primary Key of an object.
    // so we cannot "move" the offical, to be deleted, tricks by simply telling Dexie to set the trickStatus to `archived`.
    // What we *can* do however is PUT new Tricks into the Table that have trickStatus set to archived and then delete the original trick.

    // First, make sure all references to this trick are changed to the archived counterpart.
    // Currently, external references can be found in:
    // - metadata
    // - recommendedPrequisites
    // - tricks belonging to a combo
    
    // Immediately invoked promises.
    // TODO: Extract into separate functions
    // One might consider running these in parallel, but there is the risk of a 
    // race condition / working on something that is currently being modified.
    // To keep things safe it is probably better to run those in sequence.
    await (async () => {
      const result = await db.metadata.get([e.id!, "official", "Trick"])
      if(!result) {
        // There is no metadata for this entry. We wont bother with creating default metadata for now — it will get
        // created once the need arises.
        return
      }
      await db.metadata.put({
        ...result,
        entityStatus: "archived"
      })
      await db.metadata.delete([e.id!, "official", "Trick"])
      return true;
    })()

    const recommendedPrequisites = await(async () => {
      const tricksDefiningPrerequisites = await db.tricks.where("recommendedPrerequisites").equals([e.id, e.trickStatus]).toArray()
      return await Promise.allSettled(tricksDefiningPrerequisites.map( async entryContainingCurrent => {
        const newValues = (entryContainingCurrent.recommendedPrerequisites ?? []).map( ([id, status]) => {
          if(id === e.id && status === e.trickStatus) {
            return [id, "archived"] as const
          }
          return [id, status]
        })
        entryContainingCurrent.recommendedPrerequisites = DbTricksTableZod._def.shape().recommendedPrerequisites.parse(newValues)
        await db.tricks.put(entryContainingCurrent)
      }))
    })();

    recommendedPrequisites.forEach( f => {
      if(f.status === "rejected") {
        console.error(`[Offical Sync] Failed to update recommendedPrerequisites referencing ${e.technicalName}`, f)
      }
    })

    const variationOf = await(async ()=> {
      const tricksDefiningVariations = await db.tricks.where("variationOf").equals([e.id, e.trickStatus]).toArray()
      return await Promise.allSettled(tricksDefiningVariations.map( async entryContainingCurrent => {
        const newValues = (entryContainingCurrent.variationOf ?? []).map( ([id, status]) => {
          if(id === e.id && status === e.trickStatus) {
            return [id, "archived"] as const
          }
          return [id, status]
        })
        entryContainingCurrent.variationOf = DbTricksTableZod._def.shape().variationOf.parse(newValues)
        await db.tricks.put(entryContainingCurrent)
      }))
    })();

    variationOf.forEach( f => {
      if(f.status === "rejected") {
        console.error(`[Offical Sync] Failed to update variationOf referencing ${e.technicalName}`, f)
      }
    })

    const combos = await (async () => {
      const combosContainingCurrentTrick = await db.combos.where("tricks").equals([e.id, e.trickStatus]).toArray()
      return await Promise.allSettled(combosContainingCurrentTrick.map( async entryContainingCurrent => {
        const newValues = (entryContainingCurrent.tricks ?? []).map( ([id, status]) => {
          if(id === e.id && status === e.trickStatus) {
            return [id, "archived"] as const
          }
          return [id, status]
        })
        entryContainingCurrent.tricks = DbCombosTableZod._def.shape().tricks.parse(newValues)
        await db.combos.put(entryContainingCurrent)
      }))
    })()

    combos.forEach( f => {
      if(f.status === "rejected") {
        console.error(`[Offical Sync] Failed to update combos containing ${e.technicalName}`, f)
      }
    })

  }))

  const failedTrickMigrations = result.filter( e => e.status === "rejected").length

  if(failedTrickMigrations === 0) {
    console.info("All deleted offical Tricks were archived successfully.")
  }
  else {
    console.error(`${failedTrickMigrations} Tricks have failed archiving.`)
  }

  return failedTrickMigrations === 0
}



export default async function syncTricks() {
  // @ts-expect-error no d.ts
  const tricks = z.array(DbTricksTableZod).parse((await import("virtual:highline-freestyle-data")).tricks);

  const idsOfNewTricksMap = Object.fromEntries(tricks.map(e => [e.id!, true] as const))

  const allCurrentOfficalTricks = await db.tricks.where("trickStatus").equals("offical").toArray()

  // These tricks get converted into "archived" tricks.
  const tricksThatHaveBeenRemoved =  allCurrentOfficalTricks.filter(e => idsOfNewTricksMap[e.id+""] !== true)

  await handleArchiving(tricksThatHaveBeenRemoved)

  // At this point, the Database should be in a state where all to-be-archived Tricks had their references updated.
  // so we can safely PUT the new tricks into the DB.
  await db.tricks.bulkPut(tricks)

}