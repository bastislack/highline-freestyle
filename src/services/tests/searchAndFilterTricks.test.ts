import { describe, it, expect } from 'vitest';
import { getVariationsForTrick, searchInTricks, sortTricks } from '../searchAndFilterTricks';
import type { Trick } from '@/lib/database/daos/trick';
import type { SearchParameters, SortOrder } from '@/types/search';
import type { StickableStatus } from '@/lib/utils';

function makeTrick(
  overrides: Partial<Trick> & {
    id: number;
    trickStatus?: StickableStatus;
    isFavorite?: boolean;
    variationOf?: [number, StickableStatus][];
  }
): Trick {
  const trickStatus = overrides.trickStatus ?? 'official';

  return {
    primaryKey: [overrides.id, trickStatus],
    technicalName: `Trick ${overrides.id}`,
    alias: undefined,
    startPosition: 'Stand',
    endPosition: 'Stand',
    difficultyLevel: 1,
    yearEstablished: undefined,
    showInSearchQueries: true,
    variationOf: undefined,
    dateAddedEpoch: 0,
    stickFrequency: undefined,
    isFavorite: false,
    ...overrides,
  } as unknown as Trick;
}

function defaultSearchParameters(overrides: Partial<SearchParameters> = {}): SearchParameters {
  return {
    sortOrder: 'difficulty-asc',
    includedStatuses: ['official', 'userDefined', 'archived'],
    showFavoritesAtTop: true,
    preferredName: 'alias',
    ...overrides,
  };
}

function mapTrickToAttribute(_trick: Trick, _sortOrder: SortOrder) {
  return 'Difficulty 1';
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

  it('startPos: tricks should sort correctly by start position', () => {
    const trickA = makeTrick({ id: 1, startPosition: 'Drop-Knee' });
    const trickB = makeTrick({ id: 2, startPosition: 'Stand' });
    const trickC = makeTrick({ id: 3, startPosition: 'Chest' });

    const result = sortTricks([trickA, trickB, trickC], 'startPos-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    // Alphabetical order: Chest, Feet, Stand
    expect(ids).toEqual([3, 1, 2]);
  });

  it('endPos: tricks should sort correctly by end position', () => {
    const trickA = makeTrick({ id: 1, endPosition: 'Drop-Knee' });
    const trickB = makeTrick({ id: 2, endPosition: 'Stand' });
    const trickC = makeTrick({ id: 3, endPosition: 'Chest' });

    const result = sortTricks([trickA, trickB, trickC], 'endPos-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    // Alphabetical order: Chest, Feet, Stand
    expect(ids).toEqual([3, 1, 2]);
  });

  it('stickFrequency-asc: lower frequencies first, undefined at the end', () => {
    const trickA = makeTrick({ id: 1, stickFrequency: 5 });
    const trickB = makeTrick({ id: 2, stickFrequency: 1 });
    const trickC = makeTrick({ id: 3, stickFrequency: 3 });
    const trickD = makeTrick({ id: 4, stickFrequency: undefined });

    const result = sortTricks([trickA, trickB, trickC, trickD], 'stickFrequency-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    expect(ids).toEqual([2, 3, 1, 4]);
  });

  it('stickFrequency-desc: higher frequencies first, undefined at the end', () => {
    const trickA = makeTrick({ id: 1, stickFrequency: 5 });
    const trickB = makeTrick({ id: 2, stickFrequency: 1 });
    const trickC = makeTrick({ id: 3, stickFrequency: 3 });
    const trickD = makeTrick({ id: 4, stickFrequency: undefined });

    const result = sortTricks([trickA, trickB, trickC, trickD], 'stickFrequency-desc');

    const ids = result.map((t) => t.primaryKey[0]);
    // 5, 3, 1 descending, undefined last.
    expect(ids).toEqual([1, 3, 2, 4]);
  });

  it('stickFrequency-asc: treats 0 as a real value, not as undefined', () => {
    const neverTried = makeTrick({ id: 1, stickFrequency: 0 });
    const practicing = makeTrick({ id: 2, stickFrequency: 1 });
    const noData = makeTrick({ id: 3, stickFrequency: undefined });

    const result = sortTricks([noData, practicing, neverTried], 'stickFrequency-asc');

    const ids = result.map((t) => t.primaryKey[0]);
    // 0 comes before 1; undefined goes last.
    expect(ids).toEqual([1, 2, 3]);
  });

  it('difficulty-asc to startPos and back: should be sorted difficulty-asc', () => {
    const trickA = makeTrick({ id: 1, difficultyLevel: 1, startPosition: 'Exposure' });
    const trickB = makeTrick({ id: 2, difficultyLevel: 2, startPosition: 'Back' });
    const trickC = makeTrick({ id: 3, difficultyLevel: 3, startPosition: 'Sofa' });
    let trickList = [trickA, trickB, trickC];

    trickList = sortTricks(trickList, 'difficulty-asc');
    trickList = sortTricks(trickList, 'startPos-asc');
    trickList = sortTricks(trickList, 'difficulty-asc');

    const ids = trickList.map((t) => t.primaryKey[0]);

    expect(ids).toEqual([1, 2, 3]);
  });
});

describe('searchInTricks', () => {
  it('shows variation-only tricks in text search even when variations are not shown as tricks', () => {
    const parent = makeTrick({ id: 1, technicalName: 'Rocket' });
    const variation = makeTrick({
      id: 2,
      technicalName: 'Rocket variation',
      showInSearchQueries: false,
      variationOf: [[1, 'official']],
    });

    const result = searchInTricks(
      [parent, variation],
      defaultSearchParameters({ searchText: 'variation' }),
      mapTrickToAttribute,
      'Favorites',
      false
    );

    expect(result).toEqual([
      {
        title: '"variation"',
        items: [
          expect.objectContaining({
            name: 'Rocket variation',
            primaryKey: [2, 'official'],
          }),
        ],
      },
    ]);
  });

  it('surfaces favorite variations in the favorites section even when variations are hidden', () => {
    const parent = makeTrick({ id: 1, technicalName: 'Rocket' });
    const favoriteVariation = makeTrick({
      id: 2,
      technicalName: 'Rocket variation',
      showInSearchQueries: false,
      variationOf: [[1, 'official']],
      isFavorite: true,
    });

    const result = searchInTricks(
      [parent, favoriteVariation],
      defaultSearchParameters(),
      mapTrickToAttribute,
      'Favorites',
      false
    );

    expect(result[0]).toEqual({
      title: 'Favorites',
      items: [
        expect.objectContaining({
          name: 'Rocket variation',
          primaryKey: [2, 'official'],
        }),
      ],
    });
  });

  it('surfaces favorite variations in the favorites section when variations are shown', () => {
    const parent = makeTrick({ id: 1, technicalName: 'Rocket' });
    const favoriteVariation = makeTrick({
      id: 2,
      technicalName: 'Rocket variation',
      showInSearchQueries: false,
      variationOf: [[1, 'official']],
      isFavorite: true,
    });

    const result = searchInTricks(
      [parent, favoriteVariation],
      defaultSearchParameters(),
      mapTrickToAttribute,
      'Favorites',
      true
    );

    expect(result[0]).toEqual({
      title: 'Favorites',
      items: [
        expect.objectContaining({
          name: 'Rocket variation',
          primaryKey: [2, 'official'],
        }),
      ],
    });
  });
});
