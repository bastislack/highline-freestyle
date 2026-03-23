import { describe, it, expect } from 'vitest';
import { getVariationsForTrick, searchInTricks } from '../searchAndFilterTricks';
import type { Trick } from '@/lib/database/daos/trick';
import type { SearchParameters, SortOrder } from '@/types/search';
import type { StickableStatus } from '@/lib/utils';

function makeTrick(
  overrides: Partial<Trick> & {
    id: number;
    trickStatus?: StickableStatus;
    isFavourite?: boolean;
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
    isFavourite: false,
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
      isFavourite: true,
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
      isFavourite: true,
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
