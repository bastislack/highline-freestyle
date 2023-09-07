import type { MainDatabase } from "../databaseInstance";
import {getMetadata, putDefault} from "./metadataHelper";
import { Trick } from "./tricks";
import {DbObject, DbObjectDao} from "./dbObject"
import { DbMetadataZod, DbTricksTableZod } from "../schemas/CurrentVersionSchema"
import { z } from "zod";

type CreateNewTrickType = Omit<Trick, "id"| "primaryKey" | keyof DbObject>

type DbTricks = z.infer<typeof DbTricksTableZod>
type DbMeta = z.infer<typeof DbMetadataZod>

interface TricksQueryFilter {
  trickStatus?: DbTricks["trickStatus"],
  offset?: number,
  limit?: number
}


export default class TricksDAO implements DbObjectDao<Trick> {
  
  private async getNextId(trickStatus: DbTricks["trickStatus"]) {
    const currentTopId = (await this.db.tricks.where("trickStatus").equals(trickStatus).toArray()).reduce((prev, curr) => prev.id > curr.id ? prev : curr).id
    return currentTopId+1
  }
  
  constructor(private db: MainDatabase) {}

  public async getAll(filter?: TricksQueryFilter) {

    const getRelevantTricks = () => {
      const start = this.db.tricks;
      if(!filter) {
        // No filters. return as is
        return start.toArray()
      }

      let temp = start.filter( e => {
        if(filter.trickStatus && filter.trickStatus !== e.trickStatus) {
          return false
        }
        return true
      } )
      
      if(filter.offset) {
        temp = temp.offset(filter.offset)
      }
      if(filter.limit) {
        temp = temp.limit(filter.limit)
      }

      return temp.toArray()
    }
    const tricksWithoutMeta = await getRelevantTricks()
    const tricksWithMetadataPromises = tricksWithoutMeta.map( async e => ({
      trick: e,
      metadata: await getMetadata(this.db, [e.id, e.trickStatus, "Trick"])
    }))
    const result = await Promise.allSettled(tricksWithMetadataPromises)
    
    // The (undefined as never) is a bit scuffed, but basically tells TS that okResults will never contain 
    // undefined values. This is handled by the subsequent .filter. Unfortunately, TS does not understand that 
    // .filter can get rid of undefined values is simply evaluating the value's truthyness
    const okResults = result.map( e => e.status === "fulfilled" ? e.value : (undefined as never)).filter(e => e!)
    const errResults = result.map((e,i) => e.status === "rejected" ? [i,e.reason] as const : (undefined as never)).filter( e => e!)

    if(errResults.length > 0) {
      console.error("Failed to get metadata for some entities. As a result, they will not be returned. See data below")
      // Promise.allSettled does not change order of promises. So we know which error corresponds to which trick by looking at the 
      // index in the error
      for(const entry of errResults) {
        const relevantTrick = tricksWithoutMeta[entry[0]]!
        console.error({
          trick: relevantTrick,
          error: entry[1]
        })
      }
    }
    return okResults.map( e => new Trick(e.trick, e.metadata, this.db))
  }

  public async getById(id: number, trickStatus: DbTricks["trickStatus"]) {
    let [trick, meta] = await Promise.all([
      this.db.tricks.get([id, trickStatus]),
      this.db.metadata.get([id, trickStatus, "Trick"])
    ])
    if(!trick) {
      return undefined
    }
    if(!meta) {
      meta = await putDefault(this.db, [id, trickStatus, "Trick"])
    }

    return new Trick(trick, DbMetadataZod.parse(meta), this.db)
  }

  public async createNew(objectWithoutId: CreateNewTrickType, trickStatus: DbTricks["trickStatus"]) {
    const id = await this.getNextId(DbTricksTableZod._def.shape().trickStatus.parse(trickStatus))
    
    // Now ID is present -> generate metadata and trick "internal" objects.

    // First the Trick Object. Is immediately wrapped in a parse that makes sure this object 
    // adheres to the defined contract.
    const trickObject: DbTricks = DbTricksTableZod.parse({
      id,
      trickStatus,
      technicalName: objectWithoutId.technicalName,
      alias: objectWithoutId.alias,
      establishedBy: objectWithoutId.establishedBy,
      yearEstablished: objectWithoutId.yearEstablished,
      startPosition: objectWithoutId.startPosition,
      endPosition: objectWithoutId.endPosition,
      difficultyLevel: objectWithoutId.difficultyLevel,
      description: objectWithoutId.description,
      recommendedPrerequisites: objectWithoutId.recommendedPrerequisites,
      tips: objectWithoutId.tips,
      variationOf: objectWithoutId.variationOf,
      showInSearchQueries: objectWithoutId.showInSearchQueries,
      dateAddedEpoch: objectWithoutId.dateAddedEpoch,
      videos: objectWithoutId.videos
    })

    // Same w/ meta Object.
    const metaObject: DbMeta = DbMetadataZod.parse({
      id,
      entityStatus: trickStatus,
      entityCategory: "Trick",
      stickFrequency: objectWithoutId.stickFrequency,
      isFavourite: objectWithoutId.isFavourite,
      notes: objectWithoutId.notes
    })

    // if code did not throw until here, we have 2 structurally valid objects.

    // First **add** new object (this will fail if the ID is already in use 
    // (which might happen if you try to create multiple tricks at the same time))
    // then, once that is done, **put** the Metadata into the table
    // (will override already present metadata)
    await this.db.tricks.add(trickObject)

    // if here: Insertion was a success. Now insert the the Meta Data
    await this.db.metadata.put(metaObject)

    // if here, that also was a success!
    // now we just need to create a Tricks Proxy Object and return it :)

    return new Trick(trickObject, metaObject, this.db)
  }
}