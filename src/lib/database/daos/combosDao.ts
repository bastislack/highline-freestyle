import { z } from 'zod';
import type { MainDatabase } from '../databaseInstance';
import { Combo } from './combo';
import { DbObject, DbObjectDao } from './dbObject';
import { DbCombosTableZod, DbMetadataZod } from '../schemas/Version1Schema';
import { getMetadata, putDefault } from './metadataHelper';

type CreateNewComboType = Omit<Combo, 'id' | 'primaryKey' | keyof DbObject>;

type DbCombo = z.infer<typeof DbCombosTableZod>;
type DbMeta = z.infer<typeof DbMetadataZod>;

interface ComboQueryFilter {
  comboStatus?: DbCombo['comboStatus'];
  offset?: number;
  limit?: number;
}

export default class CombosDAO implements DbObjectDao<Combo> {
  private async getNextId(comboStatus: DbCombo['comboStatus']) {
    const currentTopId = (
      await this.db.combos.where('comboStatus').equals(comboStatus).toArray()
    ).reduce((prev, curr) => (prev.id > curr.id ? prev : curr)).id;
    return currentTopId;
  }

  constructor(private db: MainDatabase) {}

  public async getAll(filter?: ComboQueryFilter) {
    const getRelevantCombos = () => {
      const start = this.db.combos;
      if (!filter) {
        // No filters -> nothing to modify on the query
        return start.toArray();
      }
      this.db.combos;

      let temp = start.filter((e) => {
        if (filter.comboStatus && filter.comboStatus !== e.comboStatus) {
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

    const combosWithoutMeta = await getRelevantCombos();
    const combosWithMetaPromises = combosWithoutMeta.map(async (e) => ({
      combo: e,
      metadata: await getMetadata(this.db, [e.id, e.comboStatus, 'Combo']),
    }));

    const result = await Promise.allSettled(combosWithMetaPromises);

    const okResults = result
      .map((e) => (e.status === 'fulfilled' ? e.value : (undefined as never)))
      .filter((e) => e!);
    const errResults = result
      .map((e, i) => (e.status === 'rejected' ? ([i, e.reason] as const) : (undefined as never)))
      .filter((e) => e!);

    if (errResults.length > 0) {
      console.error(
        'Failed to get metadata for some entities. As a result, they will not be returned. See data below'
      );
      // Promise.allSettled does not change order of promises. So we know which error corresponds to which trick by looking at the
      // index in the error
      for (const entry of errResults) {
        const relevantCombo = combosWithoutMeta[entry[0]]!;
        console.error({
          trick: relevantCombo,
          error: entry[1],
        });
      }
    }
    return okResults.map((e) => new Combo(e.combo, e.metadata, this.db));
  }

  public async getById(id: number, comboStatus: DbCombo['comboStatus']) {
    const response = await Promise.all([
      this.db.combos.get([id, comboStatus]),
      this.db.metadata.get([id, comboStatus, 'Combo']),
    ]);

    const combo = response[0];
    let meta = response[1];

    if (!combo) {
      return undefined;
    }
    if (!meta) {
      meta = await putDefault(this.db, [id, comboStatus, 'Combo']);
    }

    return new Combo(combo, DbMetadataZod.parse(meta), this.db);
  }

  public async createNew(objectWithoutId: CreateNewComboType, comboStatus: DbCombo['comboStatus']) {
    const id = await this.getNextId(DbCombosTableZod._def.shape().comboStatus.parse(comboStatus));

    const comboObject: DbCombo = DbCombosTableZod.parse({
      id,
      comboStatus,
      name: objectWithoutId.name,
      establishedBy: objectWithoutId.establishedBy,
      yearEstablished: objectWithoutId.yearEstablished,
      tricks: objectWithoutId.tricks,
      description: objectWithoutId.description,
      tips: objectWithoutId.tips,
      dateAddedEpoch: objectWithoutId.dateAddedEpoch,
      videos: objectWithoutId.videos,
    });

    const metaObject: DbMeta = DbMetadataZod.parse({
      id,
      entityStatus: comboStatus,
      entityCategory: 'Combo',
      stickFrequency: objectWithoutId.stickFrequency,
      isFavourite: objectWithoutId.isFavourite,
      notes: objectWithoutId.notes,
    });
    // if code did not throw until here, we have 2 structurally valid objects.

    // First **add** new object (this will fail if the ID is already in use
    // (which might happen if you try to create multiple tricks at the same time))
    // then, once that is done, **put** the Metadata into the table
    // (will override already present metadata)
    await this.db.combos.add(comboObject);

    // if here: Insertion was a success. Now insert the the Meta Data
    await this.db.metadata.put(metaObject);

    // if here, that also was a success!
    // now we just need to create a Combo Proxy Object and return it :)
    return new Combo(comboObject, metaObject, this.db);
  }
}
