import type { SortOrder } from '@/types/search';

export type SortingOption = {
  titleKey: string;
  directionTitleKey?: string;
  value: SortOrder;
};

export const sortingOptions: SortingOption[] = [
  {
    titleKey: 'sortOptions.difficulty',
    directionTitleKey: 'sortOptions.ascending',
    value: 'difficulty-asc',
  },
  {
    titleKey: 'sortOptions.difficulty',
    directionTitleKey: 'sortOptions.descending',
    value: 'difficulty-desc',
  },
  { titleKey: 'sortOptions.startPosition', value: 'startPos' },
  { titleKey: 'sortOptions.endPosition', value: 'endPos' },
  {
    titleKey: 'sortOptions.inventionYear',
    directionTitleKey: 'sortOptions.ascending',
    value: 'yearEstablished-asc',
  },
  {
    titleKey: 'sortOptions.inventionYear',
    directionTitleKey: 'sortOptions.descending',
    value: 'yearEstablished-desc',
  },
];
