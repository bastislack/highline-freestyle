import { ref } from 'vue';
import type { StickableStatus } from '@/lib/utils';
import type { TrickNameOption } from '@/types/search';

const INCLUDED_STATUSES_KEY = 'TRICK_LIST_INCLUDED_STATUSES';
const FAVORITES_AT_TOP_KEY = 'TRICK_LIST_FAVORITES_AT_TOP';
const PREFERRED_NAME_KEY = 'TRICK_LIST_PREFERRED_NAME';

function loadIncludedStatuses(): StickableStatus[] {
  const stored = localStorage.getItem(INCLUDED_STATUSES_KEY);
  if (!stored) return ['official', 'userDefined', 'archived'];
  try {
    return JSON.parse(stored);
  } catch {
    return ['official', 'userDefined', 'archived'];
  }
}

const includedStatuses = ref<StickableStatus[]>(loadIncludedStatuses());
const showFavoritesAtTop = ref<boolean>(
  localStorage.getItem(FAVORITES_AT_TOP_KEY) !== 'false'
);
const preferredName = ref<TrickNameOption>(
  (localStorage.getItem(PREFERRED_NAME_KEY) as TrickNameOption) || 'alias'
);

export function getIncludedStatuses(): StickableStatus[] {
  return includedStatuses.value;
}

export function setIncludedStatuses(statuses: StickableStatus[]) {
  includedStatuses.value = statuses;
  localStorage.setItem(INCLUDED_STATUSES_KEY, JSON.stringify(statuses));
}

export function getShowFavoritesAtTop(): boolean {
  return showFavoritesAtTop.value;
}

export function setShowFavoritesAtTop(value: boolean) {
  showFavoritesAtTop.value = value;
  if (value) {
    localStorage.removeItem(FAVORITES_AT_TOP_KEY);
  } else {
    localStorage.setItem(FAVORITES_AT_TOP_KEY, 'false');
  }
}

export function getPreferredName(): TrickNameOption {
  return preferredName.value;
}

export function setPreferredName(value: TrickNameOption) {
  preferredName.value = value;
  localStorage.setItem(PREFERRED_NAME_KEY, value);
}
