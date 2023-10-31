import {DbObject} from "./dbObject";
import {DbTricksTableZod, DbMetadataZod} from "../schemas/CurrentVersionSchema"
import { z } from "zod";
import { MainDatabase } from "../databaseInstance";


/**
* This is the "rich" object that should be used by the UI Layer.
* It contains all the data that the frontend would care about, plus functions to modify, fetch adjacent data, etc.
*/
export class Trick implements DbObject {
  
  #modified = {
    dataFromDatabase: {
      technicalName: false,
      alias: false,
      establishedBy: false,
      yearEstablished: false,
      startPosition: false,
      endPosition: false,
      difficultyLevel: false,
      description: false,
      recommendedPrerequisites: false,
      tips: false,
      variationOf: false,
      videos: false,
      showInSearchQueries: false,
      tricks: false
    },
    metadata: {
      stickFrequency: false,
      isFavourite: false,
      notes: false
    },
    // To throw an error if trying to persist object while it is already persisting
    persisting: false,
    // To throw an error if a persist is attempted after the object has been marked for deletion.
    deleted: false
  }

  public get changed() {
    return [...Object.values(this.#modified.dataFromDatabase), ...Object.values(this.#modified.metadata)].some( e => e)
  }

  //#region Getters and Setters for Tricks Table

  // Getters and setters proxy the "raw" database entry. Setters will also
  // track changes via the private #modified property
  // Upon triggering persist() the values marked as modified will be commited.

  public get primaryKey() {
    // Primary Key is read-only -> has no setter
    return [this.dataFromDatabase.id, this.dataFromDatabase.trickStatus] as const
  }


  public get technicalName() {
    return this.dataFromDatabase.technicalName
  }
  public set technicalName(val) {
    if(val === this.dataFromDatabase.technicalName) {
      return
    }
    this.#modified.dataFromDatabase.technicalName = true
    // this might seem confusing at first, but is basically just an access of the DbTricksTable's 
    // definition of alias. This is mainly here so we have a single source of truth in 
    // terms of validation, namely DbTricksTableZod of the current Version.
    // This call will throw an error if the provided argument does not fit the contract defined
    // by the zod type.                       |                |
    //                                        |                |
    // The same thing happens with the        |                |
    // other properties, but their            |                |
    // comments are ommited.                  |                |
    //                                      vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    this.dataFromDatabase.technicalName =  DbTricksTableZod._def.shape().technicalName.parse(val)
  }

  public get alias() {
    return this.dataFromDatabase.alias
  }

  public set alias(val) {
    if(val === this.dataFromDatabase.alias) {
      return
    }
    this.#modified.dataFromDatabase.alias = true
    this.dataFromDatabase.alias = DbTricksTableZod._def.shape().alias.parse(val)

  }

  public get establishedBy() {
    return this.dataFromDatabase.establishedBy
  }
  public set establishedBy(val) {
    if(val === this.dataFromDatabase.establishedBy) {
      return
    }
    this.#modified.dataFromDatabase.establishedBy = true
    this.dataFromDatabase.alias = DbTricksTableZod._def.shape().establishedBy.parse(val)
  }

  public get startPosition() {
    return this.dataFromDatabase.startPosition
  }
  public set startPosition(val) {
    if(val === this.dataFromDatabase.startPosition) {
      return
    }
    this.#modified.dataFromDatabase.startPosition = true
    this.dataFromDatabase.startPosition = DbTricksTableZod._def.shape().startPosition.parse(val)
  }

  public get endPosition() {
    return this.dataFromDatabase.endPosition
  }
  public set endPosition(val) {
    if(val === this.dataFromDatabase.endPosition) {
      return
    }
    this.#modified.dataFromDatabase.endPosition = true
    this.dataFromDatabase.endPosition = DbTricksTableZod._def.shape().endPosition.parse(val)
  }

  public get difficultyLevel() {
    return this.dataFromDatabase.difficultyLevel
  }
  public set difficultyLevel(val) {
    if(val === this.dataFromDatabase.difficultyLevel) {
      return
    }
    this.#modified.dataFromDatabase.difficultyLevel = true
    this.dataFromDatabase.difficultyLevel = DbTricksTableZod._def.shape().difficultyLevel.parse(val)
  }

  public get yearEstablished() {
    return this.dataFromDatabase.yearEstablished;
  }
  public set yearEstablished(val) {
    if(val === this.dataFromDatabase.yearEstablished) {
      return
    }
    this.#modified.dataFromDatabase.yearEstablished = true;
    this.dataFromDatabase.yearEstablished = DbTricksTableZod._def.shape().yearEstablished.parse(val)
  }

  public get description() {
    return this.dataFromDatabase.description
  }
  public set description(val) {
    if(val === this.dataFromDatabase.description) {
      return
    }
    this.#modified.dataFromDatabase.description = true;
    this.dataFromDatabase.description = DbTricksTableZod._def.shape().description.parse(val)
  }

  public get recommendedPrerequisites() {
    if(!this.dataFromDatabase.recommendedPrerequisites) {
      return undefined
    }
    return [...this.dataFromDatabase.recommendedPrerequisites]
  }
  public set recommendedPrerequisites(val) {
    if(this.dataFromDatabase.recommendedPrerequisites === val) {
      return
    }
    if(val) {
      val = [...val]
    }
    this.#modified.dataFromDatabase.recommendedPrerequisites = true
    this.dataFromDatabase.recommendedPrerequisites = DbTricksTableZod._def.shape().recommendedPrerequisites.parse(val)
  }

  public get tips() {
    // Spread here because arrays are pass-by-reference, and we wouldnt want the UI to 
    // make changes to the backing database object directly.
    // A spread effectively does a shallow copy of the array.

    if(!this.dataFromDatabase.tips) {
      return undefined
    }

    return [...this.dataFromDatabase.tips]
  }
  public set tips(val) {
    if(val === this.dataFromDatabase.tips) {
      return
    }
    if(val) {
      // if not undefined
      val = [...val] // again doing a shallow copy so you cannot modify the reference.
    }
    this.#modified.dataFromDatabase.tips = true;
    this.dataFromDatabase.tips = DbTricksTableZod._def.shape().tips.parse(val)
  }

  public get variationOf() {
    if(!this.dataFromDatabase.variationOf) {
      return undefined
    }
    return [...this.dataFromDatabase.variationOf]
  }
  public set variationOf(val) {
    if(this.dataFromDatabase.variationOf === val) {
      return
    }
    if(val) {
      val = [...val]
    }
    this.#modified.dataFromDatabase.variationOf = true
    this.dataFromDatabase.variationOf = DbTricksTableZod._def.shape().variationOf.parse(val)
  }

  public get showInSearchQueries() {
    return this.dataFromDatabase.showInSearchQueries
  }
  public set showInSearchQueries(val) {
    if(val === this.dataFromDatabase.showInSearchQueries) {
      return
    }
    this.#modified.dataFromDatabase.showInSearchQueries = true
    this.dataFromDatabase.showInSearchQueries = DbTricksTableZod._def.shape().showInSearchQueries.parse(val)
  }

  public get dateAddedEpoch() {
    return this.dataFromDatabase.dateAddedEpoch
  }
  // dateAddedEpoch is readonly -> no setter

  public get videos() {
    if(!this.dataFromDatabase.videos) {
      return undefined
    }
    return [...this.dataFromDatabase.videos]
  }
  public set videos(val) {
    if(val === this.dataFromDatabase.videos) {
      return
    }
    if(val) {
      // not undefined -> can spread
      val = [...val]
    }
    this.#modified.dataFromDatabase.videos = true;
    this.dataFromDatabase.videos = DbTricksTableZod._def.shape().videos.parse(val)
  }
  //#endregion

  //#region Getters and Setters for Metadata Table

  public get stickFrequency() {
    return this.metadataFromDatabase.stickFrequency
  }
  public set stickFrequency(val) {
    if(val === this.metadataFromDatabase.stickFrequency) {
      return
    }
    this.#modified.metadata.stickFrequency = true
    this.metadataFromDatabase.stickFrequency = DbMetadataZod._def.shape().stickFrequency.parse(val)
  }

  public get isFavourite() {
    return this.metadataFromDatabase.isFavourite
  }
  public set isFavourite(val) {
    if(val === this.metadataFromDatabase.isFavourite) {
      return
    }
    this.#modified.metadata.isFavourite = true
    this.metadataFromDatabase.isFavourite = DbMetadataZod._def.shape().isFavourite.parse(val)
  }

  public get notes() {
    if(!this.metadataFromDatabase.notes) {
      return undefined
    }
    return this.metadataFromDatabase.notes
  }
  public set notes(val) {
    if(val === this.metadataFromDatabase.notes) {
      return
    }
    
    this.#modified.metadata.notes = true
    this.metadataFromDatabase.notes = DbMetadataZod._def.shape().notes.parse(val)
  }


  //#endregion




  /**
   * Creates a new trick Object. This constructor should be treated as "internal" — The UI Layer should make use of the `tricksDao` instead!
   */
  constructor(private dataFromDatabase: z.infer<typeof DbTricksTableZod>, private metadataFromDatabase: z.infer<typeof DbMetadataZod>, private db: MainDatabase) {}

  
  /**
   * Will push the new state for this trick to the database.
   * If refetch is true, this will then also apply the new state from the DB onto the object
   * @returns `true` on success, else an Error message
   */
  public async persist(refetch=true): Promise<string | true> {
    // For now, we just use a PUT operation. Later, we might want to consider to only
    // patch changes, but personally I do not see the benefit of that.

    if(this.#modified.deleted) {
      return "Cannot persist because this object has been marked as deleted."
    }

    if(this.#modified.persisting) {
      console.warn("Did you call .persist() twice? Did you await a response from the persist call?")
      return "Cannot persist because this object is currently getting persisted."
    }

    this.#modified.persisting = true
    //                            if any value in Object is true -> true, else false
    const hasTrickRecordChanged = Object.values(this.#modified.dataFromDatabase).some( e => e)
    const hasMetadataRecordChanged = Object.values(this.#modified.metadata).some( e => e)


    // Immediately invoked function inside a try-catch so we do not have to worry about returning inside the catch
    // in regards to cleaning up.
    let response: true | string = true
    try {
      await (async () => {
        try {
          if(hasTrickRecordChanged) {
            await this.db.tricks.put(this.dataFromDatabase)
          }
        }
        catch(err) {
          console.error(err)
          response = "Failed to push update to tricks table. See console for more info."
          return
        }

        try {
          if(hasMetadataRecordChanged) {
            await this.db.metadata.put(this.metadataFromDatabase)
          }
        }
        catch(err) {
          console.error(err)
          response = "Failed to push update to metadata table. See console for more info."
          return
        }
      })()
    }
    finally {
      // The cast is a bit cursed and wrong here, but will do for now. All keys are keyof the relevant object as we make
      // use of Object.keys here anyways.
      //                                                                                              lmao. 
      Object.keys(this.#modified.dataFromDatabase).forEach( e => this.#modified.dataFromDatabase[e as "alias"] = true)
      Object.keys(this.#modified.metadata).forEach( e => this.#modified.metadata[e as "notes"] = true)
      this.#modified.persisting = false
    }

    if(response !== true || !refetch) {
      return response // if already not on the "happy path", abort early. // also return if we do not want a refetch.
    }

    // If code here, we want a refetch
    return await this.refetch();
  }

  public async refetch(): Promise<string | true> {
    try {
      const [newTrick, newMetadata] = await Promise.all([
        this.db.tricks.get(this.primaryKey),
        this.db.metadata.get([...this.primaryKey, "Trick" as const])
      ])
      // new data fetched. Now just doing a parse with zod to validate that the 
      // data on the DB aligns with the zod types.
      this.metadataFromDatabase = DbMetadataZod.parse(newMetadata)
      this.dataFromDatabase = DbTricksTableZod.parse(newTrick)
      return true
    }
    catch(err) {
      console.error(err)
      return "Failed to sync from database. See console for more info."
    }
  }


  /**
   * Will delete the tricks and the metadata assigned to it.
   * @returns `true` on success, else an Error message
   */
  public async delete(): Promise<string | true> {
    if(this.#modified.deleted) {
      return true
    }
    try {
      await Promise.all([
        this.db.tricks.delete(this.primaryKey),
        this.db.metadata.delete([...this.primaryKey, "Tricks" as const])
      ])
      return true
    }
    catch (err) {
      console.error(err)
      return "Something went wrong when trying to delete a Trick. See the console for more info."
    }
  }




}
