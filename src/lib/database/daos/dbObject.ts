/**
 * The Proxy objects for Combos and Tricks should implement this Interface.
 * Via this interface they can commit changes to the Database.
 */

import { z } from "zod"
import { DbStickableStatusZod } from "../schemas/CurrentVersionSchema"

export type DbObject = {
  /**
   * Invoking this function will make a call to the Dexie Database.
   * If everything goes well a `true` is returned, else a string containing an error message.
   */
  persist(): Promise<true | string> 

  /**
   * Invoke this to delete an Entity.  
   * **It is the UIs responsibility to protect against - for example - deleting predefined tricks**
   */
  delete(): Promise<true | string>

  /**
   * Update the Object with values from the database.
   */
  refetch(): Promise<true | string>

  /**
   * Returns if the Object has been modified "locally"
   */
  get changed(): boolean
}

/**
 * A common interface for Database Access Objects that return {@link DbObject}s.
 */
export type DbObjectDao<T extends DbObject> = {

  getAll(): Promise<T[]>

  createNew(newObjectWithoutId: Omit<T, "id" | keyof DbObject>, entityType: z.infer<typeof DbStickableStatusZod> ): Promise<T>

}