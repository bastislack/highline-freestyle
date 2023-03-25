import Dexie, {Table} from "dexie";
import {ComboHandler} from "./comboHandler";
import {DatabaseSerializer} from "./databaseSerializer";
import {applyMigrations} from "./migrations";
// If a new Version is defined, simply increment the Version in the Import
import {UserTricksTable, UserCombosTable, PredefinedCombosTable, PredefinedTricksTable} from "./schemas/CurrentVersion";
import {TrickHandler} from "./trickHandler";

export default class MainDatabase extends Dexie {
  public declare userTricks: Table<UserTricksTable>;
  public declare userCombos: Table<UserCombosTable>;
  public declare predefinedTricks: Table<PredefinedTricksTable>;
  public declare predefinedCombos: Table<PredefinedCombosTable>;

  public readonly tricks: TrickHandler;
  public readonly combos: ComboHandler;
  public readonly serializer: DatabaseSerializer;

  public constructor() {
    super("db");
    applyMigrations(this);
    // TODO: fill db with on-ready event

    this.tricks = new TrickHandler(this);
    this.combos = new ComboHandler(this);
    this.serializer = new DatabaseSerializer(this);
  }
}
