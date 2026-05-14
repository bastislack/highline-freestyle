import type { Trick } from '@/lib/database/daos/trick';
import type { SearchResult } from '@/types/search';

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
  // O(N) lookup so the per-item checks below stay O(1) instead of scanning
  // `allTricks` on every visible item.
  const trickByKey = new Map<string, Trick>();
  for (const trick of allTricks) {
    trickByKey.set(`${trick.primaryKey[1]}:${trick.primaryKey[0]}`, trick);
  }

  const visibleTrickKeys = new Set<string>();
  const visibleTopLevelTrickKeys = new Set<string>();
  let visibleVariationCount = 0;

  for (const section of result) {
    for (const item of section.items) {
      const key = `${item.primaryKey[1]}:${item.primaryKey[0]}`;
      if (visibleTrickKeys.has(key)) continue;
      visibleTrickKeys.add(key);

      const trick = trickByKey.get(key);
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

  // Parent-key → variation-keys index, built once per call instead of
  // re-scanning `allTricks` for each visible top-level item.
  const variationKeysByParent = new Map<string, string[]>();
  for (const trick of allTricks) {
    if (!includedStatuses.includes(trick.primaryKey[1])) continue;
    if (!trick.variationOf || trick.variationOf.length === 0) continue;
    const variationKey = `${trick.primaryKey[1]}:${trick.primaryKey[0]}`;
    for (const parentKey of trick.variationOf) {
      const key = `${parentKey[1]}:${parentKey[0]}`;
      let bucket = variationKeysByParent.get(key);
      if (!bucket) {
        bucket = [];
        variationKeysByParent.set(key, bucket);
      }
      bucket.push(variationKey);
    }
  }

  const visibleVariationKeys = new Set<string>();
  for (const parentKey of visibleTopLevelTrickKeys) {
    const variationKeys = variationKeysByParent.get(parentKey);
    if (!variationKeys) continue;
    for (const vk of variationKeys) visibleVariationKeys.add(vk);
  }

  return {
    trickCount: visibleTopLevelTrickKeys.size,
    variationCount: visibleVariationKeys.size,
    totalCount: visibleTopLevelTrickKeys.size + visibleVariationKeys.size,
    showBreakdown: true,
  };
}
