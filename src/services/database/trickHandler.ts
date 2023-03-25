import {Trick} from "../../types/trick";
import {persist} from "../persistentStorage";
import MainDatabase from "./mainDatabase";
import {PredefinedTricksTable} from "./schemas/CurrentVersion";

import {trickTableToTrick, trickToTrickTable} from "./util/converters/trick";
import {tricks as predefinedTrickData} from "virtual:csvData";

export class TrickHandler {
  public constructor(private db: MainDatabase) {}

  public async dropUserTricks() {
    return await this.db.userTricks.clear();
  }

  /**
   * This will clear the predefinedTricks Table and update it with Data from the virtual module.
   */
  public async populatePredefined() {
    const tricksToPutIntoDB: PredefinedTricksTable[] = predefinedTrickData.map((e: any) =>
      trickToTrickTable(e as Trick)
    );
    await this.db.predefinedTricks.clear();
    await this.db.predefinedTricks.bulkPut(tricksToPutIntoDB);
  }

  public async getById(id: number): Promise<Trick | undefined> {
    const [userResponse, predefinedResponse] = await Promise.all([
      this.db.userTricks.get(id),
      this.db.predefinedTricks.get(id),
    ]);

    if (!userResponse && !predefinedResponse) {
      return undefined;
    }

    const trick = {
      ...predefinedResponse,
      ...userResponse,
    } as PredefinedTricksTable;
    // The cast is needed here because TS thinks the ID might be undefined.
    // This however is impossible because either needs to be set and both require the ID to be set.

    return trickTableToTrick(trick);
  }

  public async getAll(): Promise<Trick[] | undefined> {
    const [userResponse, predefinedResponse] = await Promise.all([
      this.db.userTricks.toArray(),
      this.db.predefinedTricks.toArray(),
    ]);
    let mergedData: PredefinedTricksTable[];
    if (!userResponse && !predefinedResponse) {
      return undefined;
    }
    if (!userResponse) {
      mergedData = predefinedResponse;
    } else if (!predefinedResponse) {
      mergedData = userResponse;
    } else {
      // Both are present. Do a composite where Predefined is taken as the
      // "base" layer and userTricks is taken as the override Layer.
      const lookup: Record<number, PredefinedTricksTable> = {};
      for (const entry of predefinedResponse) {
        lookup[entry.id] = entry;
      }
      for (const entry of userResponse) {
        if (!lookup[entry.id]) {
          lookup[entry.id] = entry;
        } else {
          lookup[entry.id] = {
            ...lookup[entry.id],
            ...entry,
          };
        }
      }
      mergedData = Object.values(lookup);
    }
    return mergedData.map((e) => trickTableToTrick(e));
  }

  // TODO: The "original" implementation gets *all* items from the DB as Array. I would
  // argue this is a better approach.
  public async getTupleByIds(trickIdTuple: number[]): Promise<(Trick | undefined)[]> {
    const promises = trickIdTuple.map((e) => this.getById(e));
    return await Promise.all(promises);
  }

  public async putUserTrick(trick: Trick) {
    await persist(); // TODO: Is this right? Why is the return value ignored?
    // This assumes the ID is already present according to the Zod Type Spec
    this.db.userTricks.put({...trickToTrickTable(trick), deleted: false}); // TODO: Not sure what to make with the deleted here. I just set it to false here.
  }

  public async deleteUserTrickById(id: number): Promise<void> {
    this.db.userTricks.delete(id);
  }
}
