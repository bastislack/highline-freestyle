import { DbCombosTableZod } from '../schemas/Version1Schema';
import { z } from 'zod';
import db from '../databaseInstance';

type DbCombo = z.infer<typeof DbCombosTableZod>;

async function moveCombo(
  comboId: number,
  from: DbCombo['comboStatus'],
  to: DbCombo['comboStatus']
) {
  // Fortunately, Combos only have one external references, so "moving" the combo is alot easier than moving a trick.
  const metadata = await db.metadata.get([comboId, from]);
  if (!metadata) {
    return;
  }
  const newMetadata = {
    ...metadata,
    comboStatus: to,
  };
  await db.metadata.put(newMetadata);
  await db.metadata.delete([comboId, from]);
}

async function handleArchivingCombos(archivedCombos: DbCombo[]) {
  return await Promise.allSettled(
    archivedCombos.map(async (e) =>
      db.transaction('rw', [db.combos, db.tricks, db.metadata], async () => {
        await moveCombo(e.id, 'official', 'archived');

        const newCombo = DbCombosTableZod.parse({
          ...e,
          comboStatus: 'archived',
        });

        await db.combos.put(newCombo);
        await db.combos.delete([e.id, 'official']);
      })
    )
  );
}

async function handleUnarchivingCombos(combos: DbCombo[]) {
  return await Promise.allSettled(
    combos.map(async (e) => {
      await moveCombo(e.id, 'official', 'archived');

      const newComboObject = DbCombosTableZod.parse({
        ...e,
        comboStatus: 'official',
      });

      await db.combos.put(newComboObject);
      await db.combos.delete([e.id, 'archived']);
    })
  );
}

/**
 * This function will sync combos between the official Repo and the local (browser) database.
 *
 * **Note that this is expected to run AFTER syncTricks!**
 */
export default async function syncCombos() {
  const combos = z
    .array(DbCombosTableZod)
    .parse((await import('virtual:highline-freestyle-data')).combos);
  console.log(combos);
  const idsOfNewCombosMap = Object.fromEntries(combos.map((e) => [String(e.id), true]));

  const allCurrentOfficialCombos = await db.combos
    .where('[id+comboStatus]')
    .between([0, 'official'], [Infinity, 'official'])
    .toArray();

  const combosThatHaveBeenRemoved = allCurrentOfficialCombos.filter(
    (e) => !idsOfNewCombosMap[String(e.id)]
  );

  if (combosThatHaveBeenRemoved.length > 0) {
    const result = await handleArchivingCombos(combosThatHaveBeenRemoved);
    const errors = result
      .map((e) => (e.status === 'rejected' ? e.reason : (undefined as never)))
      .filter((e) => e);
    if (errors.length > 0) {
      console.error(errors);
    }
  }

  {
    const result = await handleUnarchivingCombos(combos);
    const errors = result
      .map((e) => (e.status === 'rejected' ? e.reason : (undefined as never)))
      .filter((e) => e);
    if (errors.length > 0) {
      console.error(errors);
    }
  }

  // At this point, the Database should be in a state where all to-be-archived Combos had their references updated.
  // so we can safely PUT the new combos into the DB.
  await db.combos.bulkPut(combos);
}
