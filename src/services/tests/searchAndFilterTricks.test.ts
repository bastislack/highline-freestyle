import { describe, it, expect } from 'vitest';
import { getVariationsForTrick } from '../searchAndFilterTricks';
import { Trick } from '@/lib/database/daos/trick';
import { z } from 'zod';
import { DbTricksTableZod, DbMetadataZod } from '@/lib/database/schemas/CurrentVersionSchema';

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
  return new Trick(data, metadata, null as any);
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
