import type { Trick } from '@/lib/database/daos/trick';
import type { SearchResult } from '@/types/search';
import { getVariationsForTrick } from '@/services/searchAndFilterTricks';

export type TrickListCountSummary = {
  trickCount: number;
  variationCount: number;
  totalCount: number;
  showBreakdown: boolean;
};

export function buildCountSummary(
  allTricks: Trick[],
  result: SearchResult,
  includedStatuses: string[],
  variationsShownAsTricks: boolean,
  hasSearchText: boolean
): TrickListCountSummary {
  const visibleTrickKeys = new Set<string>();
  const visibleTopLevelTrickKeys = new Set<string>();
  let visibleVariationCount = 0;

  for (const section of result) {
    for (const item of section.items) {
      const key = `${item.primaryKey[1]}:${item.primaryKey[0]}`;
      if (visibleTrickKeys.has(key)) continue;
      visibleTrickKeys.add(key);

      const trick = allTricks.find(
        (candidate) =>
          candidate.primaryKey[0] === item.primaryKey[0] &&
          candidate.primaryKey[1] === item.primaryKey[1]
      );
      const isVariation = (trick?.variationOf?.length ?? 0) > 0;
      if (isVariation) {
        visibleVariationCount++;
      } else {
        visibleTopLevelTrickKeys.add(key);
      }
    }
  }

  if (hasSearchText || variationsShownAsTricks) {
    return {
      trickCount: visibleTrickKeys.size - visibleVariationCount,
      variationCount: visibleVariationCount,
      totalCount: visibleTrickKeys.size,
      showBreakdown: false,
    };
  }

  const visibleVariationKeys = new Set<string>();
  for (const section of result) {
    for (const item of section.items) {
      const variations = getVariationsForTrick(
        allTricks,
        item.primaryKey[0],
        item.primaryKey[1],
        includedStatuses
      );
      for (const variation of variations) {
        visibleVariationKeys.add(`${variation.primaryKey[1]}:${variation.primaryKey[0]}`);
      }
    }
  }

  return {
    trickCount: visibleTopLevelTrickKeys.size,
    variationCount: visibleVariationKeys.size,
    totalCount: visibleTopLevelTrickKeys.size + visibleVariationKeys.size,
    showBreakdown: true,
  };
}
