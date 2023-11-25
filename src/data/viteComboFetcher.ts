/**
 * **WARNING** This module is expected to be invoked from a Vite Plugin!
 *
 * Aggregated all YAML Files in the ./combos Directory and interpretes
 */

import { parse } from 'yaml';
import { DbCombosTableZod, DbTricksTableZod } from '../lib/database/schemas/CurrentVersionSchema';
import { readFile } from 'node:fs/promises';
import { ZodError, z } from 'zod';
import { globby } from 'globby';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { YamlComboTableSchemaZod } from './viteSchemaGenerator';

async function fetchYamlFile(path: string) {
  const asObject = YamlComboTableSchemaZod.parse(parse(await readFile(path, 'utf8')));

  if (!asObject.tricks) {
    throw new Error('Combos must contain at least one trick.');
  }

  // cast as any on the next line is okay as we immediately parse the object with Zod.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asObject.tricks = asObject.tricks.map((trickId) => [trickId, 'official']) as any;
  // Makes sure the YAML has the right structure.
  return DbCombosTableZod.parse({ ...asObject, comboStatus: 'official' });
}

/**
 * This takes a list of Database Entities and creates a mapping of ID → List of Objects
 *
 * This can be used to detect duplicates or to check if an Entity with a given ID exists.
 */
function createRecordLookup<
  T extends z.infer<typeof DbCombosTableZod> | z.infer<typeof DbTricksTableZod>,
>(allEntities: T[]) {
  const idToEntityLookup: Record<number, T[]> = {};

  allEntities.forEach((databaseEntity) => {
    if (!idToEntityLookup[databaseEntity.id]) {
      idToEntityLookup[databaseEntity.id] = [];
    }
    idToEntityLookup[databaseEntity.id].push(databaseEntity);
  });
  return idToEntityLookup;
}

function findDuplicateKeys(allCombos: z.infer<typeof DbCombosTableZod>[]) {
  const idToComboLookup: Record<number, z.infer<typeof DbCombosTableZod>[]> =
    createRecordLookup(allCombos);

  return Object.entries(idToComboLookup)
    .filter(([_, combo]) => combo.length > 1)
    .map(([k, v]) => ({
      id: k,
      names: v.map((trick) => trick.name),
    }));
}

function findUndefinedTrickReferences(
  allCombos: z.infer<typeof DbCombosTableZod>[],
  allTricks: z.infer<typeof DbTricksTableZod>[]
) {
  const idToTrickLookup: Record<number, z.infer<typeof DbTricksTableZod>[]> =
    createRecordLookup(allTricks);

  // issues define the ID of the Combo and an issue message
  const issues: [number, string][] = [];

  allCombos.forEach((combo) => {
    if (combo.tricks) {
      combo.tricks.forEach((trickKey, i) => {
        if (trickKey[1] !== 'official') {
          // This should never happen, as the `official` status is added by the Build Process.
          // It's still kept here for now in case that ever changes in the future.
          issues.push([
            combo.id,
            `All tricks must limit themselves to official ones (not the case for ${i + 1}. Entry)`,
          ]);
        } else if (!idToTrickLookup[trickKey[0]]) {
          issues.push([
            combo.id,
            `${i + 1}. Entry in tricks references an ID that does not exist (id: ${trickKey[0]}).`,
          ]);
        }
      });
    }
  });

  return issues;
}

export default async function viteGetAllCombos(tricks: z.infer<typeof DbTricksTableZod>[]) {
  // @ts-expect-error Because there are effectively two TS Projects (Vite Plugin Context
  //and Vue Webapp Context), TS gets a bit confused and doesn't think import.meta.url is allowed here
  const pattern = join(fileURLToPath(import.meta.url), '..', 'combos', '*.yaml');
  const allFilePaths = await globby(pattern);

  const parsedYamlFiles = await Promise.allSettled(
    allFilePaths.map((comboFilePath) => fetchYamlFile(comboFilePath))
  );
  const erroredFiles = parsedYamlFiles
    .map((fileResult, i) =>
      fileResult.status === 'rejected'
        ? { error: fileResult.reason, path: allFilePaths[i] }
        : (undefined as never)
    )
    .filter(Boolean);
  const goodFiles = parsedYamlFiles
    .map((fileResult) =>
      fileResult.status === 'fulfilled' ? fileResult.value : (undefined as never)
    )
    .filter(Boolean);

  if (erroredFiles.length) {
    const errorMeta = erroredFiles.map((file) => {
      if (!(file.error instanceof ZodError)) {
        return String(file.error);
      }
      return (
        file.path +
        '\n' +
        file.error.errors.map((error) => `${error.path}: ${error.message}`).join('\n')
      );
    });

    throw {
      plugin: 'vite-plugin-highline-freestyle-data',
      message: 'At least one Combo file could not be parsed.\n\n' + errorMeta,
    };
  }

  const duplicateIds = findDuplicateKeys(goodFiles);
  if (duplicateIds.length > 0) {
    throw {
      plugin: 'vite-plugin-highline-freestyle-data',
      message: 'Some Combos contain the same ID.\n\n' + JSON.stringify(duplicateIds),
    };
  }

  const emptyCombos = goodFiles
    .filter((combo) => !combo.tricks || combo.tricks.length < 2)
    .map((combo) => [combo.id, 'Combo needs at least 2 tricks'] as const);
  if (emptyCombos.length > 0) {
    throw {
      plugin: 'vite-plugin-highline-freestyle-data',
      message:
        'Empty Combos detected.\n\n' +
        emptyCombos
          .map(([comboId, errorMessage]) => `Failed Combo: ${comboId}. Issue: ${errorMessage}`)
          .join('\n'),
    };
  }

  const undefinedReferences = findUndefinedTrickReferences(goodFiles, tricks);
  if (undefinedReferences.length > 0) {
    throw {
      plugin: 'vite-plugin-highline-freestyle-data',
      message:
        'Undefined trick reference found.\n\n' +
        undefinedReferences
          .map(([comboId, errorMessage]) => `Failed Combo: ${comboId}. Issue: ${errorMessage}`)
          .join('\n'),
    };
  }

  return goodFiles;
}
