import Dexie, { Table } from 'dexie';
import { z } from 'zod';
import { DbTricksTableZod, DbCombosTableZod, DbMetadataZod } from './schemas/CurrentVersionSchema';
import applyMigrations from './schemas/migrations';
import TricksDAO from './daos/tricksDao';
import CombosDAO from './daos/combosDao';

export class MainDatabase extends Dexie {
  public declare tricks: Table<z.infer<typeof DbTricksTableZod>>;
  public declare combos: Table<z.infer<typeof DbCombosTableZod>>;
  public declare metadata: Table<z.infer<typeof DbMetadataZod>>;

  public readonly tricksDao: TricksDAO;
  public readonly combosDao: CombosDAO;

  protected constructor() {
    super('db');
    applyMigrations(this);
    this.tricksDao = new TricksDAO(this);
    this.combosDao = new CombosDAO(this);
  }

  public static get instance() {
    return this.singletonInstance || (this.singletonInstance = new this());
  }

  private static singletonInstance: MainDatabase | undefined;
}

export default MainDatabase.instance;
