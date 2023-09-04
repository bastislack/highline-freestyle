import type { MainDatabase } from "../databaseInstance";


export default class CombosDAO {
  public get temp() {
    return this.db
  }

  constructor(private db: MainDatabase) {
  }
}