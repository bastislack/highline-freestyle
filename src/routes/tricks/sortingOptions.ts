import type { SortDirection, SortField, SortOrder } from '@/types/search';

export type SortFieldOption = {
  titleKey: string;
  value: SortField;
};

export const sortFieldOptions: SortFieldOption[] = [
  { titleKey: 'sortOptions.difficulty', value: 'difficulty' },
  { titleKey: 'sortOptions.startPosition', value: 'startPos' },
  { titleKey: 'sortOptions.endPosition', value: 'endPos' },
  { titleKey: 'sortOptions.inventionYear', value: 'yearEstablished' },
  { titleKey: 'sortOptions.stickFrequency', value: 'stickFrequency' },
];

export function parseSortOrder(order: SortOrder): { field: SortField; direction: SortDirection } {
  const [field, direction] = order.split('-') as [SortField, SortDirection];
  return { field, direction };
}

export function buildSortOrder(field: SortField, direction: SortDirection): SortOrder {
  return `${field}-${direction}` as SortOrder;
}

// Older builds stored 'startPos' / 'endPos' without a direction suffix.
export function migrateLegacySortOrder(raw: string | null): SortOrder | null {
  if (!raw) return null;
  if (raw === 'startPos' || raw === 'endPos') return `${raw}-asc` as SortOrder;
  return raw as SortOrder;
}
