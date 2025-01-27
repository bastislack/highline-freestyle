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
  isNew: boolean;
  isFavorite: boolean;
};

export type SortOrder =
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'startPos'
  | 'endPos'
  | 'yearEstablished-asc'
  | 'yearEstablished-desc';

export type SearchParameters = {
  searchText?: string;
  sortOrder: SortOrder;
  includedStatuses: StickableStatus[];
};
