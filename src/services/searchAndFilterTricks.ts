import { Trick } from '@/lib/database/daos/trick';
import { SearchItem, SearchParameters, SearchResult, SortOrder } from '@/types/search';
import { isStickableNew } from '@/util/misc';

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

function searchItemFromTrick(trick: Trick): SearchItem {
  return {
    name: trick.alias ?? trick.technicalName,
    primaryKey: [trick.primaryKey[0], trick.primaryKey[1]],
    stickFrequency: trick.stickFrequency,
    isFavorite: trick.isFavourite,
    isNew: isStickableNew(trick.dateAddedEpoch),
  };
}

function groupTricksToSearchResult(
  sortedTricks: Trick[],
  sorting: SortOrder,
  mapTrickToAttribute: (t: Trick, sort: SortOrder) => string
): SearchResult {
  let currentGroup = mapTrickToAttribute(sortedTricks[0], sorting);
  const result: SearchResult = [{ title: currentGroup, items: [] }];

  for (const trick of sortedTricks) {
    if (mapTrickToAttribute(trick, sorting) !== currentGroup) {
      currentGroup = mapTrickToAttribute(trick, sorting);
      result.push({ title: currentGroup, items: [] });
    }
    const searchItem = searchItemFromTrick(trick);
    result[result.length - 1].items.push(searchItem);
  }
  return result;
}

export function searchInTricks(
  allTricks: Trick[],
  searchParameters: SearchParameters,
  mapTrickToAttribute: (t: Trick, sort: SortOrder) => string
): SearchResult {
  const sortedTricks = sortTricks(allTricks, searchParameters.sortOrder);
  const searchResult = groupTricksToSearchResult(
    sortedTricks,
    searchParameters.sortOrder,
    mapTrickToAttribute
  );
  return searchResult;
}
