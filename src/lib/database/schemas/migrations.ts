import { MainDatabase } from '../databaseInstance';
import { schema as schemaVersion1 } from './Version1Schema';

export default function applyMigrations(db: MainDatabase) {
  db.version(1).stores(schemaVersion1);
}
