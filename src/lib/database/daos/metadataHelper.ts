import { z } from 'zod';
import type { MainDatabase } from '../databaseInstance';
import { DbMetadataZod } from '../schemas/CurrentVersionSchema';

type MetadataTable = z.infer<typeof DbMetadataZod>;

type PrimaryKey = [
  MetadataTable['id'],
  MetadataTable['entityStatus'],
  MetadataTable['entityCategory'],
];

export async function putDefault(db: MainDatabase, primaryKey: PrimaryKey) {
  const [id, entityStatus, entityCategory] = primaryKey;

  const newObject: MetadataTable = {
    id,
    entityStatus,
    entityCategory,
    isFavourite: false,
  };
  // Throws Error if object does not meet Contract.
  await db.metadata.put(DbMetadataZod.parse(newObject));
  return await db.metadata.get(primaryKey);
}

export async function getMetadata(
  db: MainDatabase,
  primaryKey: PrimaryKey,
  createDefaultIfNotExist = true
) {
  const initialResponse = await db.metadata.get(primaryKey);
  if (!initialResponse) {
    // if here: Metadata does not exist.
    if (!createDefaultIfNotExist) {
      throw new Error(`No metadata with key [${primaryKey.join(',')}] exists.`);
    }

    const newlyCreatedResult = await putDefault(db, primaryKey);
    if (!newlyCreatedResult) {
      throw new Error(`Failed to autocreate metadata with key [${primaryKey.join(',')}].`);
    }
    return newlyCreatedResult;
  }
  return initialResponse;
}
