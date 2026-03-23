import { describe, expect, it } from 'vitest';
import type { Trick } from '@/lib/database/daos/trick';
import type { SearchResult } from '@/types/search';
import type { StickableStatus } from '@/lib/utils';
import { buildCountSummary } from './trickListCountSummary';

function makeTrick(
  overrides: Partial<Trick> & {
    id: number;
    trickStatus?: StickableStatus;
    variationOf?: [number, StickableStatus][];
    isFavourite?: boolean;
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

function makeSearchPrimaryKey(trick: Trick): [number, 'official' | 'userDefined' | 'archived'] {
  return [trick.primaryKey[0], trick.primaryKey[1]];
}

describe('buildCountSummary', () => {
  it('does not let favorite variation cards skew the count when variations are hidden', () => {
    const parent = makeTrick({ id: 1 });
    const favoriteVariation = makeTrick({
      id: 2,
      technicalName: 'Favorite variation',
      showInSearchQueries: false,
      variationOf: [[1, 'official']],
      isFavourite: true,
    });

    const result: SearchResult = [
      {
        title: 'Favorites',
        items: [
          {
            name: favoriteVariation.technicalName,
            primaryKey: makeSearchPrimaryKey(favoriteVariation),
            isFavorite: true,
            isNew: false,
          },
        ],
      },
      {
        title: 'Difficulty 1',
        items: [
          {
            name: parent.technicalName,
            primaryKey: makeSearchPrimaryKey(parent),
            isFavorite: false,
            isNew: false,
          },
        ],
      },
    ];

    const summary = buildCountSummary(
      [parent, favoriteVariation],
      result,
      ['official'],
      false,
      false
    );

    expect(summary).toEqual({
      trickCount: 1,
      variationCount: 1,
      totalCount: 2,
      showBreakdown: true,
    });
  });

  it('counts visible top-level tricks and attached variations in the default breakdown', () => {
    const firstParent = makeTrick({ id: 1 });
    const secondParent = makeTrick({ id: 2 });
    const variation = makeTrick({
      id: 3,
      technicalName: 'Variation of 1',
      showInSearchQueries: false,
      variationOf: [[1, 'official']],
    });

    const result: SearchResult = [
      {
        title: 'Difficulty 1',
        items: [
          {
            name: firstParent.technicalName,
            primaryKey: makeSearchPrimaryKey(firstParent),
            isFavorite: false,
            isNew: false,
          },
          {
            name: secondParent.technicalName,
            primaryKey: makeSearchPrimaryKey(secondParent),
            isFavorite: false,
            isNew: false,
          },
        ],
      },
    ];

    const summary = buildCountSummary(
      [firstParent, secondParent, variation],
      result,
      ['official'],
      false,
      false
    );

    expect(summary).toEqual({
      trickCount: 2,
      variationCount: 1,
      totalCount: 3,
      showBreakdown: true,
    });
  });
});
