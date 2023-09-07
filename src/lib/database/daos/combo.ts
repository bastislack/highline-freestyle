import {DbObject} from "./dbObject";
import {DbCombosTableZod, DbMetadataZod} from "../schemas/CurrentVersionSchema"
import { z } from "zod";
import { MainDatabase } from "../databaseInstance";


/**
* This is the "rich" object that should be used by the UI Layer.
* It contains all the data that the frontend would care about, plus functions to modify, fetch adjacent data, etc.
*/
export class Combo implements DbObject {
  
  #modified = {
    dataFromDatabase: {
      alias: false,
      establishedBy: false,
      yearEstablished: false,
      technicalName: false,
      description: false,
      tips: false,
      videos: false,
      comboStatus: false,
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

  //#region Getters and Setters for Combo Table

  // Getters and setters proxy the "raw" database entry. Setters will also
  // track changes via the private #modified property
  // Upon triggering persist() the values marked as modified will be commited.

  public get primaryKey() {
    // Primary Key is read-only -> has no setter
    return [this.dataFromDatabase.id, this.dataFromDatabase.comboStatus] as const
  }

  public get technicalName() {
    return this.dataFromDatabase.technicalName
  }
  public set technicalName(val) {
    if(val === this.dataFromDatabase.technicalName) {
      return
    }
    this.#modified.dataFromDatabase.technicalName = true;
    this.dataFromDatabase.technicalName = DbCombosTableZod._def.shape().technicalName.parse(val)
  }


  public get alias() {
    return this.dataFromDatabase.alias
  }

  public set alias(val) {
    if(val === this.dataFromDatabase.alias) {
      return
    }
    this.#modified.dataFromDatabase.alias = true
    // this might seem confusing at first, but is basically just an access of the DbComboTable's 
    // definition of alias. This is mainly here so we have a single source of truth in 
    // terms of validation, namely DbCombosTableZod of the current Version.
    // This call will throw an error if the provided argument does not fit the contract defined
    // by the zod type.                       |                |
    //                                        |                |
    // The same thing happens with the        |                |
    // other properties, but their            |                |
    // comments are ommited.                  |                |
    //                            vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    this.dataFromDatabase.alias = DbCombosTableZod._def.shape().alias.parse(val)

  }

  public get establishedBy() {
    return this.dataFromDatabase.establishedBy
  }
  public set establishedBy(val) {
    if(val === this.dataFromDatabase.establishedBy) {
      return
    }
    this.#modified.dataFromDatabase.establishedBy = true
    this.dataFromDatabase.alias = DbCombosTableZod._def.shape().establishedBy.parse(val)
  }

  public get yearEstablished() {
    return this.dataFromDatabase.yearEstablished;
  }
  public set yearEstablished(val) {
    if(val === this.dataFromDatabase.yearEstablished) {
      return
    }
    this.#modified.dataFromDatabase.yearEstablished = true;
    this.dataFromDatabase.yearEstablished = DbCombosTableZod._def.shape().yearEstablished.parse(val)
  }

  public get tricks() {
    return [...this.dataFromDatabase.tricks]
  }
  public set tricks(val) {
    if(val === this.dataFromDatabase.tricks) {
      return
    }
    this.#modified.dataFromDatabase.tricks = true;
    this.dataFromDatabase.tricks = DbCombosTableZod._def.shape().tricks.parse(val)
  }



  public get description() {
    return this.dataFromDatabase.description
  }
  public set description(val) {
    if(val === this.dataFromDatabase.description) {
      return
    }
    this.#modified.dataFromDatabase.description = true;
    this.dataFromDatabase.description = DbCombosTableZod._def.shape().description.parse(val)
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
    this.dataFromDatabase.tips = DbCombosTableZod._def.shape().tips.parse(val)
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
    this.dataFromDatabase.videos = DbCombosTableZod._def.shape().videos.parse(val)
  }

  public get comboStatus() {
    return this.dataFromDatabase.comboStatus;
  }
  public set comboStatus(val) {
    if(val === this.dataFromDatabase.comboStatus) {
      return
    }
    this.#modified.dataFromDatabase.comboStatus = true;
    this.dataFromDatabase.comboStatus = DbCombosTableZod._def.shape().comboStatus.parse(val)
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
   * Creates a new Combo Object. This constructor should be treated as "internal" — The UI Layer should make use of the `combosDao` instead!
   */
  constructor(private dataFromDatabase: z.infer<typeof DbCombosTableZod>, private metadataFromDatabase: z.infer<typeof DbMetadataZod>, private db: MainDatabase) {}

  
  /**
   * Will push the new state for this combo to the database.
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
    const hasComboRecordChanged = Object.values(this.#modified.dataFromDatabase).some( e => e)
    const hasMetadataRecordChanged = Object.values(this.#modified.metadata).some( e => e)


    // Immediately invoked function inside a try-catch so we do not have to worry about returning inside the catch
    // in regards to cleaning up.
    let response: true | string = true
    try {
      await (async () => {
        try {
          if(hasComboRecordChanged) {
            await this.db.combos.put(this.dataFromDatabase)
          }
        }
        catch(err) {
          console.error(err)
          response = "Failed to push update to combos table. See console for more info."
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
      const [newCombo, newMetadata] = await Promise.all([
        this.db.combos.get(this.primaryKey),
        this.db.metadata.get([...this.primaryKey, "Combo" as const])
      ])
      // new data fetched. Now just doing a parse with zod to validate that the 
      // data on the DB aligns with the zod types.
      this.metadataFromDatabase = DbMetadataZod.parse(newMetadata)
      this.dataFromDatabase = DbCombosTableZod.parse(newCombo)
      return true
    }
    catch(err) {
      console.error(err)
      return "Failed to sync from database. See console for more info."
    }
  }


  /**
   * Will delete the combo and the metadata assigned to it.
   * This will keep the tricks belonging to the combo unaffected
   * @returns `true` on success, else an Error message
   */
  public async delete(): Promise<string | true> {
    if(this.#modified.deleted) {
      return true
    }
    try {
      await Promise.all([
        this.db.combos.delete(this.primaryKey),
        this.db.metadata.delete([...this.primaryKey, "Combo" as const])
      ])
      return true
    }
    catch (err) {
      console.error(err)
      return "Something went wrong when trying to delete a Combo. See the console for more info."
    }
  }




}
