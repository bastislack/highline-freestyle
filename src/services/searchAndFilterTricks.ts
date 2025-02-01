import { Trick } from '@/lib/database/daos/trick';
import {
  SearchItem,
  SearchParameters,
  SearchResult,
  SearchSection,
  SortOrder,
  TrickNameOption,
} from '@/types/search';
import { isStickableNew } from '@/util/misc';

function equalLengthStringDistance(a: string, b: string): number {
  if (a.length !== b.length) {
    throw new Error('Both strings need to be of equal length.');
  }

  // Here exists the option to swap out the UNEQUAL_CHARACTER_DISTANCE for a
  // more sophisticated distance between characters (based on the distance
  // between them on a keyboard for typos, or based on how similar they sound
  //  for example)
  const UNEQUAL_CHARACTER_DISTANCE = 1;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff += a.charAt(i) == b.charAt(i) ? 0 : UNEQUAL_CHARACTER_DISTANCE;
  }
  return diff;
}

function textDistance(baseText: string, query: string): number {
  const PENALTY_PER_MISSING_CHAR = 1;

  let minDist = Infinity;
  for (let originalStartIdx = 0; originalStartIdx < baseText.length; originalStartIdx++) {
    const maxCommonLength = Math.min(query.length, baseText.length - originalStartIdx);
    const cutToLengthBase = baseText.substring(
      originalStartIdx,
      originalStartIdx + maxCommonLength
    );
    const cutToLengthQuery = query.substring(0, maxCommonLength);

    const dist = equalLengthStringDistance(cutToLengthBase, cutToLengthQuery);
    const missingCharacterPenalty = PENALTY_PER_MISSING_CHAR * (query.length - maxCommonLength);
    minDist = Math.min(minDist, dist + missingCharacterPenalty);
  }

  const unmatchedCharactersPenalty = 1 - 1 / (Math.abs(baseText.length - query.length) + 1);
  return minDist + unmatchedCharactersPenalty;
}

function trickNameDistance(
  trick: Trick,
  query: string
): { distance: number; nameToUse: TrickNameOption } {
  query = query.toLowerCase();
  const technicalName = trick.technicalName.toLowerCase();
  const alias = (trick.alias || '').toLowerCase();

  const distanceTechnicalName = textDistance(technicalName, query);
  const distanceAlias = textDistance(alias, query);

  return distanceAlias <= distanceTechnicalName
    ? { distance: distanceAlias, nameToUse: 'alias' }
    : { distance: distanceTechnicalName, nameToUse: 'technicalName' };
}

function textSearch(
  tricks: Trick[],
  query: string
): { trick: Trick; nameToUse: TrickNameOption }[] {
  const MATCH_DISTANCE_MAX = Math.ceil(query.length / 3);
  return tricks
    .map((trick) => {
      const { distance, nameToUse } = trickNameDistance(trick, query);
      return {
        trick: trick,
        dist: distance,
        nameToUse: nameToUse,
      };
    })
    .filter((elem) => elem.dist <= MATCH_DISTANCE_MAX)
    .sort((a, b) => a.dist - b.dist)
    .map((elem) => {
      return {
        trick: elem.trick,
        nameToUse: elem.nameToUse,
      };
    });
}

function comparePrimaryKey(a: Trick, b: Trick): number {
  const statusOrder = ['official', 'userDefined', 'archived'];
  const statusDiff = statusOrder.indexOf(a.primaryKey[1]) - statusOrder.indexOf(b.primaryKey[1]);
  return statusDiff || a.primaryKey[0] - b.primaryKey[0];
}

function compareDifficulty(a: Trick, b: Trick): number {
  const difficultyA = a.difficultyLevel || Number.MAX_VALUE;
  const difficultyB = b.difficultyLevel || Number.MAX_VALUE;
  return difficultyA - difficultyB;
}

function compareLowerCaseString(a: string, b: string): number {
  if (a.toLowerCase() < b.toLowerCase()) return -1;
  if (a.toLowerCase() > b.toLowerCase()) return 1;
  return 0;
}

function compareStartPosition(a: Trick, b: Trick): number {
  return compareLowerCaseString(a.startPosition, b.startPosition);
}

function compareEndPosition(a: Trick, b: Trick): number {
  return compareLowerCaseString(a.endPosition, b.endPosition);
}

function compareYearEstablished(a: Trick, b: Trick): number {
  const yearEstablishedA: number = a.yearEstablished ?? Number.MAX_VALUE;
  const yearEstablishedB: number = b.yearEstablished ?? Number.MAX_VALUE;
  return yearEstablishedA - yearEstablishedB;
}

function sortTricks(tricks: Trick[], sorting: SortOrder): Trick[] {
  switch (sorting) {
    case 'difficulty-asc':
      return tricks.sort((a, b) => compareDifficulty(a, b) || comparePrimaryKey(a, b));
    case 'difficulty-desc':
      return tricks.sort((a, b) => -compareDifficulty(a, b) || comparePrimaryKey(a, b));
    case 'startPos':
      return tricks.sort((a, b) => compareStartPosition(a, b) || comparePrimaryKey(a, b));
    case 'endPos':
      return tricks.sort((a, b) => compareEndPosition(a, b) || comparePrimaryKey(a, b));
    case 'yearEstablished-asc':
      return tricks.sort((a, b) => compareYearEstablished(a, b) || comparePrimaryKey(a, b));
    case 'yearEstablished-desc':
      return tricks.sort((a, b) => -compareYearEstablished(a, b) || comparePrimaryKey(a, b));
  }
}

function searchItemFromTrick(trick: Trick, name: TrickNameOption): SearchItem {
  return {
    name: name === 'alias' ? trick.alias ?? trick.technicalName : trick.technicalName,
    primaryKey: [trick.primaryKey[0], trick.primaryKey[1]],
    stickFrequency: trick.stickFrequency,
    isFavorite: trick.isFavourite,
    isNew: isStickableNew(trick.dateAddedEpoch),
  };
}

function groupTricksToSearchResult(
  sortedTricks: Trick[],
  sorting: SortOrder,
  mapTrickToAttribute: (t: Trick, sort: SortOrder) => string,
  nameToUse: TrickNameOption
): SearchResult {
  if (sortedTricks.length === 0) {
    return [];
  }
  let currentGroup = mapTrickToAttribute(sortedTricks[0], sorting);
  const result: SearchResult = [{ title: currentGroup, items: [] }];

  for (const trick of sortedTricks) {
    if (mapTrickToAttribute(trick, sorting) !== currentGroup) {
      currentGroup = mapTrickToAttribute(trick, sorting);
      result.push({ title: currentGroup, items: [] });
    }
    const searchItem = searchItemFromTrick(trick, nameToUse);
    result[result.length - 1].items.push(searchItem);
  }
  return result;
}

export function searchInTricks(
  allTricks: Trick[],
  searchParameters: SearchParameters,
  mapTrickToAttribute: (t: Trick, sort: SortOrder) => string,
  favoritesSectionTitle: string
): SearchResult {
  if (searchParameters.searchText !== undefined && searchParameters.searchText !== '') {
    const matchingTricks = textSearch(allTricks, searchParameters.searchText);
    const searchItems = matchingTricks.map((trickWithInfo) =>
      searchItemFromTrick(trickWithInfo.trick, trickWithInfo.nameToUse)
    );
    return [
      {
        title: `"${searchParameters.searchText}"`,
        items: searchItems,
      },
    ];
  }

  const filteredTricks = allTricks.filter((trick) =>
    searchParameters.includedStatuses.includes(trick.primaryKey[1])
  );

  const sortedTricks = sortTricks(filteredTricks, searchParameters.sortOrder);

  if (!searchParameters.showFavoritesAtTop) {
    return groupTricksToSearchResult(
      sortedTricks,
      searchParameters.sortOrder,
      mapTrickToAttribute,
      searchParameters.preferredName
    );
  }

  const isolatedFavorites = sortedTricks.filter((trick) => trick.isFavourite);

  if (isolatedFavorites.length == 0) {
    return groupTricksToSearchResult(
      sortedTricks,
      searchParameters.sortOrder,
      mapTrickToAttribute,
      searchParameters.preferredName
    );
  }

  const sortedTricksWithoutFavorites = sortedTricks.filter((trick) => !trick.isFavourite);
  const favoritesSearchItem: SearchSection = {
    title: favoritesSectionTitle,
    items: isolatedFavorites.map((trick) =>
      searchItemFromTrick(trick, searchParameters.preferredName)
    ),
  };
  const searchResultWithoutFavorites = groupTricksToSearchResult(
    sortedTricksWithoutFavorites,
    searchParameters.sortOrder,
    mapTrickToAttribute,
    searchParameters.preferredName
  );
  return [favoritesSearchItem].concat(searchResultWithoutFavorites);
}
