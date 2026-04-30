import type { MainDatabase } from '../databaseInstance';
import { putDefault } from './metadataHelper';
import { Trick } from './trick';
import { DbObject, DbObjectDao } from './dbObject';
import { DbMetadataZod, DbTricksTableZod } from '../schemas/CurrentVersionSchema';
import { z } from 'zod';

type DbMetadataRow = z.infer<typeof DbMetadataZod>;

export type CreateNewTrickType = Omit<Trick, 'id' | 'primaryKey' | keyof DbObject>;

type DbTricks = z.infer<typeof DbTricksTableZod>;
type DbMeta = z.infer<typeof DbMetadataZod>;

interface TricksQueryFilter {
  trickStatus?: DbTricks['trickStatus'];
  offset?: number;
  limit?: number;
}

export default class TricksDAO implements DbObjectDao<Trick> {
  private async getNextId(trickStatus: DbTricks['trickStatus']) {
    const currentTopId = (
      await this.db.tricks
        .where('[id+trickStatus]')
        .between([0, trickStatus], [Infinity, trickStatus])
        .toArray()
    ).reduce((prev, curr) => (prev.id > curr.id ? prev : curr)).id;
    return currentTopId + 1;
  }

  /**
   * Creates a new Trick Object. This constructor should be treated as "internal" — The UI Layer should make use of the `tricksDao` instead of trying to create this object itself!
   */
  constructor(private db: MainDatabase) {}

  public async getAll(filter?: TricksQueryFilter) {
    const getRelevantTricks = () => {
      const start = this.db.tricks;
      if (!filter) {
        // No filters. return as is
        return start.toArray();
      }

      let temp = start.filter((e) => {
        if (filter.trickStatus && filter.trickStatus !== e.trickStatus) {
          return false;
        }
        return true;
      });

      if (filter.offset) {
        temp = temp.offset(filter.offset);
      }
      if (filter.limit) {
        temp = temp.limit(filter.limit);
      }

      return temp.toArray();
    };
    const tricksWithoutMeta = await getRelevantTricks();
    if (tricksWithoutMeta.length === 0) return [];

    // Single bulkGet vs N round-trips — see issue #430.
    const metadataKeys = tricksWithoutMeta.map((t) => [t.id, t.trickStatus, 'Trick'] as const);
    const fetchedMetadata = await this.db.metadata.bulkGet(
      metadataKeys as unknown as [number, DbTricks['trickStatus'], 'Trick'][]
    );

    const missingDefaults: DbMetadataRow[] = [];
    const results: Trick[] = [];
    const errors: { trick: (typeof tricksWithoutMeta)[number]; error: unknown }[] = [];

    for (let i = 0; i < tricksWithoutMeta.length; i++) {
      const trick = tricksWithoutMeta[i]!;
      const raw = fetchedMetadata[i];
      try {
        let meta: DbMetadataRow;
        if (raw) {
          meta = DbMetadataZod.parse(raw);
        } else {
          meta = DbMetadataZod.parse({
            id: trick.id,
            entityStatus: trick.trickStatus,
            entityCategory: 'Trick',
            isFavorite: false,
          });
          missingDefaults.push(meta);
        }
        results.push(new Trick(trick, meta, this.db));
      } catch (error) {
        errors.push({ trick, error });
      }
    }

    if (missingDefaults.length > 0) {
      // Fire-and-forget: persist auto-created defaults so future reads find them.
      // Matches the per-trick getMetadata() behavior the bulk path replaced.
      this.db.metadata.bulkPut(missingDefaults).catch((err) => {
        console.error('Failed to persist default metadata rows', err);
      });
    }

    if (errors.length > 0) {
      console.error(
        'Failed to get metadata for some entities. As a result, they will not be returned. See data below'
      );
      for (const entry of errors) {
        console.error({ trick: entry.trick, error: entry.error });
      }
    }

    return results;
  }

  public async getById(id: number, trickStatus: DbTricks['trickStatus']) {
    const response = await Promise.all([
      this.db.tricks.get([id, trickStatus]),
      this.db.metadata.get([id, trickStatus, 'Trick']),
    ]);
    const trick = response[0];
    let meta = response[1];

    if (!trick) {
      return undefined;
    }
    if (!meta) {
      meta = await putDefault(this.db, [id, trickStatus, 'Trick']);
    }

    return new Trick(trick, DbMetadataZod.parse(meta), this.db);
  }

  public async createNew(
    objectWithoutId: CreateNewTrickType,
    trickStatus: DbTricks['trickStatus']
  ) {
    const id = await this.getNextId(DbTricksTableZod._def.shape().trickStatus.parse(trickStatus));

    // Now ID is present -> generate metadata and trick "internal" objects.

    // First the Trick Object. Is immediately wrapped in a parse that makes sure this object
    // adheres to the defined contract.
    const trickObject: DbTricks = DbTricksTableZod.parse({
      id,
      trickStatus,
      technicalName: objectWithoutId.technicalName,
      alias: objectWithoutId.alias,
      establishedBy: objectWithoutId.establishedBy,
      yearEstablished: objectWithoutId.yearEstablished,
      startPosition: objectWithoutId.startPosition,
      endPosition: objectWithoutId.endPosition,
      difficultyLevel: objectWithoutId.difficultyLevel,
      description: objectWithoutId.description,
      recommendedPrerequisites: objectWithoutId.recommendedPrerequisites,
      tips: objectWithoutId.tips,
      variationOf: objectWithoutId.variationOf,
      showInSearchQueries: objectWithoutId.showInSearchQueries,
      dateAddedEpoch: objectWithoutId.dateAddedEpoch,
      videos: objectWithoutId.videos,
    });

    // Same w/ meta Object.
    const metaObject: DbMeta = DbMetadataZod.parse({
      id,
      entityStatus: trickStatus,
      entityCategory: 'Trick',
      stickFrequency: objectWithoutId.stickFrequency,
      isFavorite: objectWithoutId.isFavorite,
      notes: objectWithoutId.notes,
    });

    // if code did not throw until here, we have 2 structurally valid objects.

    // First **add** new object (this will fail if the ID is already in use
    // (which might happen if you try to create multiple tricks at the same time))
    // then, once that is done, **put** the Metadata into the table
    // (will override already present metadata)
    await this.db.tricks.add(trickObject);

    // if here: Insertion was a success. Now insert the the Meta Data
    await this.db.metadata.put(metaObject);

    // if here, that also was a success!
    // now we just need to create a Tricks Proxy Object and return it :)

    return new Trick(trickObject, metaObject, this.db);
  }
}
