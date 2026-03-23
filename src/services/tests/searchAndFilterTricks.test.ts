import { describe, it, expect } from 'vitest';
import { getVariationsForTrick, sortTricks } from '../searchAndFilterTricks';
import { Trick } from '@/lib/database/daos/trick';
import { z } from 'zod';
import { DbTricksTableZod, DbMetadataZod } from '@/lib/database/schemas/CurrentVersionSchema';
import { MainDatabase } from '@/lib/database/databaseInstance';

type DbTrick = z.infer<typeof DbTricksTableZod>;
type DbMetadata = z.infer<typeof DbMetadataZod>;

function makeTrick(
  overrides: Partial<DbTrick> & { id: number },
  metadataOverrides: Partial<DbMetadata> = {}
): Trick {
  const data: DbTrick = {
    trickStatus: 'official',
    technicalName: `Trick ${overrides.id}`,
    startPosition: 'Stand',
    endPosition: 'Stand',
    showInSearchQueries: true,
    dateAddedEpoch: 0,
    ...overrides,
  };
  const metadata: DbMetadata = {
    id: data.id,
    entityStatus: data.trickStatus,
    entityCategory: 'Trick',
    isFavourite: false,
    ...metadataOverrides,
  };
  // Pass null as db since we won't call persist/refetch in tests
  return new Trick(data, metadata, null as unknown as MainDatabase);
}

describe('getVariationsForTrick', () => {
  it('returns variations that reference the given trick as parent', () => {
    const parent = makeTrick({ id: 1 });
    const variation = makeTrick({
      id: 2,
      technicalName: 'Variation of 1',
      variationOf: [[1, 'official']],
    });
    const unrelated = makeTrick({ id: 3 });

    const result = getVariationsForTrick([parent, variation, unrelated], 1, 'official', [
      'official',
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].technicalName).toBe('Variation of 1');
  });

  it('returns empty array when no variations exist', () => {
    const parent = makeTrick({ id: 1 });
    const other = makeTrick({ id: 2 });

    const result = getVariationsForTrick([parent, other], 1, 'official', ['official']);

    expect(result).toHaveLength(0);
  });

  it('filters out variations with excluded statuses', () => {
    const parent = makeTrick({ id: 1 });
    const archivedVariation = makeTrick({
      id: 2,
      trickStatus: 'archived',
      variationOf: [[1, 'official']],
    });

    const result = getVariationsForTrick([parent, archivedVariation], 1, 'official', ['official']);

    expect(result).toHaveLength(0);
  });

  it('includes variations when their status is in includedStatuses', () => {
    const parent = makeTrick({ id: 1 });
    const archivedVariation = makeTrick({
      id: 2,
      trickStatus: 'archived',
      variationOf: [[1, 'official']],
    });

    const result = getVariationsForTrick([parent, archivedVariation], 1, 'official', [
      'official',
      'archived',
    ]);

    expect(result).toHaveLength(1);
  });

  it('returns multiple variations for the same parent', () => {
    const parent = makeTrick({ id: 1 });
    const v1 = makeTrick({ id: 2, variationOf: [[1, 'official']] });
    const v2 = makeTrick({ id: 3, variationOf: [[1, 'official']] });

    const result = getVariationsForTrick([parent, v1, v2], 1, 'official', ['official']);

    expect(result).toHaveLength(2);
  });

  it('matches parent by both id and status', () => {
    const parent = makeTrick({ id: 1, trickStatus: 'userDefined' });
    const variation = makeTrick({
      id: 2,
      variationOf: [[1, 'official']],
    });

    // Looking for userDefined parent, but variation references official parent
    const result = getVariationsForTrick([parent, variation], 1, 'userDefined', [
      'official',
      'userDefined',
    ]);

    expect(result).toHaveLength(0);
  });
});

describe('sortTricks', () => {
  it('difficulty-asc: tricks with undefined difficulty should be at the end', () => {
    const trickA = makeTrick({ id: 1, difficultyLevel: 2 });
    const trickB = makeTrick({ id: 2, difficultyLevel: undefined });
    const trickC = makeTrick({ id: 3, difficultyLevel: 1 });

    const result = sortTricks([trickA, trickB, trickC], 'difficulty-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    // Defined tricks sorted ascending, then undefined at the end
    expect(ids).toEqual([3, 1, 2]);
  });

  it('difficulty-desc: tricks with undefined difficulty should STILL be at the end', () => {
    const trickA = makeTrick({ id: 1, difficultyLevel: 2 });
    const trickB = makeTrick({ id: 2, difficultyLevel: undefined });
    const trickC = makeTrick({ id: 3, difficultyLevel: 1 });

    const result = sortTricks([trickA, trickB, trickC], 'difficulty-desc');

    const ids = result.map((t) => t.primaryKey[0]);
    // Defined tricks sorted descending, then undefined at the end
    expect(ids).toEqual([1, 3, 2]);
  });

  it('yearEstablished-asc: tricks with undefined year should be at the end', () => {
    const trickA = makeTrick({ id: 1, yearEstablished: 2020 });
    const trickB = makeTrick({ id: 2, yearEstablished: undefined });
    const trickC = makeTrick({ id: 3, yearEstablished: 2015 });

    const result = sortTricks([trickA, trickB, trickC], 'yearEstablished-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    // Defined years sorted ascending, then undefined at the end
    expect(ids).toEqual([3, 1, 2]);
  });

  it('yearEstablished-desc: tricks with undefined year should STILL be at the end', () => {
    const trickA = makeTrick({ id: 1, yearEstablished: 2020 });
    const trickB = makeTrick({ id: 2, yearEstablished: undefined });
    const trickC = makeTrick({ id: 3, yearEstablished: 2015 });

    const result = sortTricks([trickA, trickB, trickC], 'yearEstablished-desc');

    const ids = result.map((t) => t.primaryKey[0]);
    // Defined years sorted descending, then undefined at the end
    expect(ids).toEqual([1, 3, 2]);
  });

  it('difficulty-asc: tricks with defined difficulty should sort correctly in ascending order', () => {
    const trickA = makeTrick({ id: 1, difficultyLevel: 3 });
    const trickB = makeTrick({ id: 2, difficultyLevel: 1 });
    const trickC = makeTrick({ id: 3, difficultyLevel: 2 });

    const result = sortTricks([trickA, trickB, trickC], 'difficulty-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    expect(ids).toEqual([2, 3, 1]);
  });

  it('difficulty-desc: tricks with defined difficulty should sort correctly with undefined at the end', () => {
    const trickA = makeTrick({ id: 1, difficultyLevel: 3 });
    const trickB = makeTrick({ id: 2, difficultyLevel: 1 });
    const trickC = makeTrick({ id: 3, difficultyLevel: 2 });
    const trickD = makeTrick({ id: 4, difficultyLevel: undefined });

    const result = sortTricks([trickA, trickB, trickC, trickD], 'difficulty-desc');

    const ids = result.map((t) => t.primaryKey[0]);
    // 3, 2, 1 descending by difficulty, then undefined at the end
    expect(ids).toEqual([1, 3, 2, 4]);
  });

  it('yearEstablished-asc: tricks with defined year should sort correctly in ascending order', () => {
    const trickA = makeTrick({ id: 1, yearEstablished: 2022 });
    const trickB = makeTrick({ id: 2, yearEstablished: 2018 });
    const trickC = makeTrick({ id: 3, yearEstablished: 2020 });

    const result = sortTricks([trickA, trickB, trickC], 'yearEstablished-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    expect(ids).toEqual([2, 3, 1]);
  });

  it('yearEstablished-desc: tricks with defined year should sort correctly with undefined at the end', () => {
    const trickA = makeTrick({ id: 1, yearEstablished: 2022 });
    const trickB = makeTrick({ id: 2, yearEstablished: 2018 });
    const trickC = makeTrick({ id: 3, yearEstablished: 2020 });
    const trickD = makeTrick({ id: 4, yearEstablished: undefined });

    const result = sortTricks([trickA, trickB, trickC, trickD], 'yearEstablished-desc');

    const ids = result.map((t) => t.primaryKey[0]);
    // 2022, 2020, 2018 descending by year, then undefined at the end
    expect(ids).toEqual([1, 3, 2, 4]);
  });
});
