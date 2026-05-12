import { PrimaryKey, StickableStatus } from '@/lib/utils';

export type SearchResult = SearchSection[];

export type SearchSection = {
  title: string;
  items: SearchItem[];
};

export type SearchItem = {
  name: string;
  primaryKey: PrimaryKey;
  stickFrequency?: number;
  difficultyLevel?: number;
  isNew: boolean;
  isFavorite: boolean;
};

export type SortField = 'difficulty' | 'startPos' | 'endPos' | 'yearEstablished';
export type SortDirection = 'asc' | 'desc';

export type SortOrder =
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'startPos-asc'
  | 'startPos-desc'
  | 'endPos-asc'
  | 'endPos-desc'
  | 'yearEstablished-asc'
  | 'yearEstablished-desc';

export type TrickNameOption = 'alias' | 'technicalName';

export type SearchParameters = {
  searchText?: string;
  sortOrder: SortOrder;
  includedStatuses: StickableStatus[];
  showFavoritesAtTop: boolean;
  preferredName: TrickNameOption;
};
