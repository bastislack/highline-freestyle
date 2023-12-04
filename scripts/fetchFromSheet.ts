// This script is used to fetch the Tricks, Combos and Videos tables from Google Sheets
// and create YAML Files out of them.
// Invoke using npx vite-node ./scripts/fetchFromSheet.ts from the project root.

import chalk from 'chalk';
import { readFile, unlink, writeFile } from 'fs/promises';
import { globby } from 'globby';
import { join } from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';
import { stringify } from 'yaml';
import { z } from 'zod';

/**
 * Fetches a Tab-Separated Value File from Google Sheets and returns as a nested array of lines of columns.
 */
async function fetchTsvFromGoogleSheets(sheetId: string, sheetGid: string) {
  const response = await fetch(
    new URL(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv&id=${sheetId}&gid=${sheetGid}`
    )
  );
  if (!response.ok) {
    throw new Error(`Response was not ok. SheetId: ${sheetId}, SheetGid: ${sheetGid}`);
  }
  const asText = await response.text();
  const lines = asText.split('\r\n');
  const cells = lines.map((e) => e.split('\t'));
  return cells;
}

console.log(chalk.blue('Fetching CSVs from Google Sheets...'));

const [tricksCells, combosCells, videoCells] = await Promise.allSettled(
  [
    { sheetId: '1h1PGIrOPx16KH8IOiMh3SD1bSh1xIWFFrSL84Xyxj38', sheetGid: '0', name: 'Tricks' },
    {
      sheetId: '1h1PGIrOPx16KH8IOiMh3SD1bSh1xIWFFrSL84Xyxj38',
      sheetGid: '2129196972',
      name: 'Combos',
    },
    {
      sheetId: '1h1PGIrOPx16KH8IOiMh3SD1bSh1xIWFFrSL84Xyxj38',
      sheetGid: '738540593',
      name: 'Videos',
    },
  ]
    .map(async (e) => [e.name, await fetchTsvFromGoogleSheets(e.sheetId, e.sheetGid)] as const)
    .map((e) =>
      e
        .then((e) => {
          console.log(chalk.green(`Fetched ${e[0]}, found ${e[1].length - 1} rows.`));
          return e[1];
        })
        .catch((e) => {
          console.log(chalk.red(`Failed to fetch a table; ${e}`));
          throw e;
        })
    )
);

if (tricksCells.status === 'rejected') {
  console.log(chalk.red('Failed to get Tricks from Sheets'));
  console.log(chalk.gray(tricksCells.reason));
  exit(1);
}
if (combosCells.status === 'rejected') {
  console.log(chalk.red('Failed to get Combos from Sheets'));
  console.log(chalk.gray(combosCells.reason));

  exit(1);
}
if (videoCells.status === 'rejected') {
  console.log(chalk.red('Failed to get Video from Sheets'));
  console.log(chalk.gray(videoCells.reason));
  exit(1);
}

// We have the cells above. Create objects

function turnRowsIntoObjects(rowsWithHeader: string[][]) {
  if (rowsWithHeader.length === 0) {
    console.log(chalk.red('Failed to get Data from Sheets'));
    console.log(chalk.gray('A table does not contain any data, not even a header row'));
    exit(1);
  }
  const colLen = rowsWithHeader[0].length;
  if (colLen === 0) {
    console.log(chalk.red('Failed to get Data from Sheets'));
    console.log(chalk.gray('A table does not contain any columns'));
    exit(1);
  }

  // Missing cells are bad, additional cells are fine and can be ignored
  if (rowsWithHeader.some((e) => e.length < colLen)) {
    console.log(chalk.red('Failed to get Data from Sheets'));
    console.log(chalk.gray('A table has rows with missing cells'));
    exit(1);
  }

  const header = rowsWithHeader[0];

  return (
    rowsWithHeader
      // Skip the header row
      .filter((_, index) => index > 0)
      .map(
        // create [headerName, cellValue] Tuple array
        (row) =>
          header
            .map((head, i) => [head, row[i]] as const)
            .filter(([_, val]) => val.trim().length > 0)
      )
      // and turn the tuple array into {headerName: cellValue} entries
      .map((e) => Object.fromEntries(e))
  );
}

const [trickRawObjects, combosRawObjects, videoRawObjects] = [
  tricksCells,
  combosCells,
  videoCells,
].map((e) => turnRowsIntoObjects(e.value));

// Videos need to be done first so they can be used in Trick and Combo-Objects
// We create a Lookup-Map instead of an array here.

const videoLookup: Record<string, { link: string; startTime: number; endTime: number }[]> = {};

videoRawObjects.forEach((e) => {
  const key = `${e.category}-${e.id}`;
  if (!videoLookup[key]) {
    videoLookup[key] = [];
  }
  videoLookup[key].push({
    link: e.link,
    startTime: Number(e.startTimeSeconds),
    endTime: Number(e.endTimeSeconds),
  });
});

const { YamlTrickTableSchemaZod, YamlComboTableSchemaZod } = await import(
  '../src/data/viteSchemaGenerator'
);

console.log(chalk.blue(`Parsing Tricks...`));

const trickObjects = trickRawObjects.map((e) =>
  YamlTrickTableSchemaZod.safeParse({
    ...e,
    id: Number(e.id),
    recommendedPrerequisites: e.recommendedPrerequisites
      ? e.recommendedPrerequisites.split(',').map((e) => Number(e.trim()))
      : [],
    variationOf: e.variationOf ? e.variationOf.split(',').map((e) => Number(e.trim())) : [],
    tips: (e.tips ?? '')
      .split(';')
      .map((e) => e.trim())
      .filter(Boolean),
    videos: videoLookup['trick-' + e.id],
    difficultyLevel: Number(e.difficultyLevel),
    showInSearchQueries: e.showInSearchQueries === 'TRUE',
    dateAddedEpoch: new Date(e.dateAddedIso8601).getTime(),
    yearEstablished: e.yearEstablished ? Number(e.yearEstablished) : undefined,
  } as z.infer<typeof YamlTrickTableSchemaZod>)
);

if (trickObjects.some((e) => !e.success)) {
  console.log(
    chalk.red('Some Tricks could not be parsed. They must be corrected in the Google Sheet')
  );
  trickObjects
    .map((e, i) => [e, i] as const)
    .filter(([e]) => !e.success)
    .map(([e, i]) => (e.success ? (e.data as never) : ([e.error, i] as const)))
    .map(([e, i]) =>
      console.log(chalk.red(`[trick-${trickRawObjects[i]['id']}]:`), chalk.gray(e.toString()))
    );
  exit(2);
}

console.log(chalk.green(`Successfully parsed ${trickObjects.length} Tricks.`));

console.log(chalk.blue(`Parsing Combos...`));

const comboObjects = combosRawObjects.map((e) =>
  YamlComboTableSchemaZod.safeParse({
    ...e,
    id: Number(e.id),
    tips: (e.tips ?? '')
      .split(';')
      .map((e) => e.trim())
      .filter(Boolean),
    dateAddedEpoch: new Date(e.dateAddedIso8601).getTime(),
    yearEstablished: e.yearEstablished ? Number(e.yearEstablished) : undefined,
    tricks: (e.tricks ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
      .map(Number),
    videos: videoLookup['combo-' + e.id],
  } as z.infer<typeof YamlComboTableSchemaZod>)
);

if (comboObjects.some((e) => !e.success)) {
  console.log(
    chalk.red('Some Combos could not be parsed. They must be corrected in the Google Sheet')
  );
  comboObjects
    .map((e, i) => [e, i] as const)
    .filter(([e]) => !e.success)
    .map(([e, i]) => (e.success ? (e.data as never) : ([e.error, i] as const)))
    .map(([e, i]) =>
      console.log(chalk.red(`[combo-${combosRawObjects[i]['id']}]:`), chalk.gray(e.toString()))
    );
  exit(2);
}

console.log(chalk.green(`Successfully parsed ${comboObjects.length} Combos.`));

// Determing which files to purge. If they have a `#keep` comment anywhere
// in the file at the start of a line, this Combo/Trick is kept.

async function determineIfFileIsKept(fullPath: string) {
  const yamlContent = await readFile(fullPath, 'utf-8');
  const isKept = yamlContent
    .split('\n')
    .map((e) => e.trim())
    .some((e) => e.startsWith('#keep'));

  if (isKept) {
    console.log(chalk.gray(`  File ${fullPath} is`), chalk.green(`kept`));
  }
  return isKept;
}

console.log(
  chalk.blue('Deleting entries from Tricks-Folder. (keeping Tricks commented with #keep)')
);

const allTrickFiles = await globby(
  join(fileURLToPath(import.meta.url), '../../src/data/tricks/*.yaml')
);

await Promise.all(
  (
    await Promise.all(
      allTrickFiles.map(async (e) => ((await determineIfFileIsKept(e)) ? undefined : e))
    )
  )
    .filter(Boolean)
    .map(async (e) => {
      await unlink(e!);
      console.log(chalk.gray(`  File ${e} is`), chalk.red(`deleted`));
    })
);

console.log(
  chalk.blue('Deleting entries from Combos-Folder. (keeping Combos commented with #keep)')
);

const allComboFiles = await globby(
  join(fileURLToPath(import.meta.url), '../../src/data/combos/*.yaml')
);

await Promise.all(
  (
    await Promise.all(
      allComboFiles.map(async (e) => ((await determineIfFileIsKept(e)) ? undefined : e))
    )
  )
    .filter(Boolean)
    .map(async (e) => {
      await unlink(e!);
      console.log(chalk.gray(`  File ${e} is`), chalk.red(`deleted`));
    })
);

// Now all "automatically tracked" Tricks / Combos are out of the repo.

function createContentForEntity(data: unknown) {
  const yamlContent = stringify(data);
  const preamble = `
  This file has been generated automatically. The data here is backed by a Google Sheet.
  Do not change this by hand, as any changes will be overwritten the next time the 
  fetchFromSheet-Script is run by a scheduled action.
  If there are new changes that need to be synced, you can trigger the refetch by running
  npx vite-node ./scripts/fetchFromSheet.ts from the project root. 
  `;

  return (
    preamble
      .split('\n')
      .map((e) => '# ' + e.trimStart())
      .join('\n') +
    '\n\n' +
    yamlContent
  );
}

console.log(chalk.blue('Writing new Trick files...'));
await Promise.all(
  trickObjects
    .map((e) => (e.success === true ? e.data : (undefined as never)))
    .map(async (e) => {
      const fileName = `${e.id}-${e.technicalName.toLowerCase().trim().replaceAll(' ', '-')}`;
      const fullPath = join(
        fileURLToPath(import.meta.url),
        `../../src/data/tricks/${fileName}.yaml`
      );
      const content = createContentForEntity(e);
      console.log(chalk.gray(`  File ${fullPath} is`), chalk.green(`created`));
      await writeFile(fullPath, content, 'utf8');
    })
);

console.log(chalk.blue('Writing new Combo files...'));
await Promise.all(
  comboObjects
    .map((e) => (e.success === true ? e.data : (undefined as never)))
    .map(async (e) => {
      const fileName = `${e.id}-${e.name.toLowerCase().trim().replaceAll(' ', '-')}`;
      const fullPath = join(
        fileURLToPath(import.meta.url),
        `../../src/data/combos/${fileName}.yaml`
      );
      const content = createContentForEntity(e);
      console.log(chalk.gray(`  File ${fullPath} is`), chalk.green(`created`));
      await writeFile(fullPath, content, 'utf8');
    })
);

console.log(chalk.green('Script finished updating Tricks and Combos from the sheet 🥳'));
