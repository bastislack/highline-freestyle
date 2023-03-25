import MainDatabase from "./mainDatabase";
import {combos} from "virtual:csvData";
import {Combo} from "../../types/combo";
import {comboTableToCombo, comboToComboTable} from "./util/converters/combo";
import {persist} from "../persistentStorage";

export class ComboHandler {
  public constructor(private db: MainDatabase) {}

  public async dropUserCombos() {
    return await this.db.userCombos.clear();
  }

  public async populatePredefined() {
    const convertedCombos = (combos as Combo[]).map(comboToComboTable);
    await this.db.predefinedCombos.clear();
    await this.db.predefinedCombos.bulkPut(convertedCombos);
  }

  public async getById(id: number) {
    const userResponse = await this.db.userCombos.get(id);
    if (userResponse) {
      return comboTableToCombo(userResponse);
    }
    const predefinedResponse = await this.db.predefinedCombos.get(id);
    if (predefinedResponse) {
      return comboTableToCombo(predefinedResponse);
    }
    return undefined;
  }

  public async getAll() {
    const userCombos = await this.db.userCombos.toArray();
    const userKeys = userCombos.map((e) => e.id);
    // query all only predefinedCombos which don't have the same id as the userCombos
    // and concat these to the userCombos
    // also filter out combos which are marked deleted
    const predefinedCombos = await this.db.predefinedCombos.where("id").noneOf(userKeys).toArray();
    return [...userCombos.filter((e) => !e.deleted), ...predefinedCombos];
  }

  public async putUserCombo(combo: Combo) {
    await persist();

    const comboTable = comboToComboTable(combo);
    // This assumes that combo.id is set (according to TS Interface)
    await this.db.userCombos.put({...comboTable, deleted: false});
  }

  public async deleteUserCombo(id: number) {
    const result = await this.db.userCombos.get(id);
    if (result) {
      result.deleted = true;
      await this.db.userCombos.put(result);
    }
  }
}
