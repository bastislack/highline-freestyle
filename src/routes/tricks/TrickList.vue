<script lang="ts" setup>
import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { tricksDao } from '@/lib/database';

defineOptions({ name: 'TrickList' });
import { isOfficialSyncing } from '@/lib/database/official';
import { PrimaryKey } from '@/lib/utils';
import {
  SearchItem,
  SearchParameters,
  SearchResult,
  SearchSection,
  SortOrder,
} from '@/types/search';
import { Trick } from '@/lib/database/daos/trick';
import { searchInTricks, getVariationsForTrick } from '@/services/searchAndFilterTricks';
import { getShowVariationsAsTricks } from '@/util/variationPreferences';
import {
  getIncludedStatuses,
  getShowFavoritesAtTop,
  getPreferredName,
} from '@/util/trickListPreferences';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Header from '@/components/stickable/Header.vue';
import TrickSearchMenu from '@/components/stickable/list/TrickSearchMenu.vue';
import TrickFilterPopover from '@/components/stickable/list/TrickFilterPopover.vue';
import StickableSearchResult from '@/components/stickable/list/StickableSearchResult.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Section from '@/components/ui/section/Section.vue';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/vue/dist/iconify.js';
import ImgArmsCrossedUrl from '@/assets/img/arms_crossed.svg?url';
import ImgLogoUrl from '@/assets/logo/logo_big.svg?url';
import TrickListSkeleton from './TrickListSkeleton.vue';
import ErrorInfo from '@/components/ErrorInfo.vue';

import { useI18n } from 'vue-i18n';
import { i18nMerge } from '@/i18n/i18nmerge';
import messages_list from '@/i18n/list';
import messages_positions from '@/i18n/common/positions';
import messages_navbar from '@/i18n/navbar';
import { isStickableNew } from '@/util/misc';
import { buildCountSummary } from './trickListCountSummary';

const i18n = useI18n({
  messages: i18nMerge(messages_list, messages_positions, messages_navbar),
  scope: 'local',
});
const { t } = i18n;

const LOCAL_STORAGE_SORT_KEY = 'SearchParameters-Tricks-SortOrder';
const LOCAL_STORAGE_COLLAPSED_SECTIONS_KEY = 'TrickList-CollapsedSections';
const SESSION_STORAGE_SCROLL_KEY = 'TrickList-ScrollY';
const SESSION_STORAGE_SEARCH_KEY = 'TrickList-SearchText';

function loadSortOrder(): SortOrder {
  return (localStorage.getItem(LOCAL_STORAGE_SORT_KEY) as SortOrder) || 'difficulty-asc';
}

function loadSearchText(): string | undefined {
  return sessionStorage.getItem(SESSION_STORAGE_SEARCH_KEY) ?? undefined;
}

function loadCollapsedSections(): Set<string> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_COLLAPSED_SECTIONS_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // ignore malformed data
  }
  return new Set();
}

function saveCollapsedSections(sections: Set<string>) {
  localStorage.setItem(LOCAL_STORAGE_COLLAPSED_SECTIONS_KEY, JSON.stringify([...sections]));
}

const collapsedSections = ref<Set<string>>(loadCollapsedSections());
const isFilterPopoverOpen = ref(false);

function getCollapsedSectionKey(sectionId: string): string {
  return `section:${sectionId}`;
}

function isSectionOpen(sectionId: string): boolean {
  return !collapsedSections.value.has(getCollapsedSectionKey(sectionId));
}

function toggleSection(sectionId: string, open: boolean) {
  const updated = new Set(collapsedSections.value);
  const sectionKey = getCollapsedSectionKey(sectionId);
  if (open) {
    updated.delete(sectionKey);
  } else {
    updated.add(sectionKey);
  }
  collapsedSections.value = updated;
  saveCollapsedSections(updated);
}

const searchText = ref<string | undefined>(loadSearchText());
// Debounced copy drives search/group/render so a fast typer doesn't pay for
// rendering every intermediate match set (e.g. "R" → "Ro" → "Rol" → "Roll"
// each match hundreds of tricks). Input itself stays bound to the raw ref so
// the field never feels laggy. Clearing skips the debounce — empty doesn't
// have a hot-prefix problem and the user wants the full list back instantly.
const SEARCH_DEBOUNCE_MS = 200;
const searchTextDebounced = ref<string | undefined>(searchText.value);
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchText, (val) => {
  clearTimeout(searchDebounceTimer);
  if (!val) {
    searchTextDebounced.value = val;
    return;
  }
  searchDebounceTimer = setTimeout(() => {
    searchTextDebounced.value = val;
  }, SEARCH_DEBOUNCE_MS);
});
onDeactivated(() => clearTimeout(searchDebounceTimer));
onUnmounted(() => clearTimeout(searchDebounceTimer));
const sortOrder = ref<SortOrder>(loadSortOrder());

// Show nothing for the first 200ms; if data still isn't ready, show a skeleton
// placeholder. Avoids skeleton flash on fast loads while preventing the
// "no tricks" empty state from leaking through during slower initial loads.
const SKELETON_DELAY_MS = 200;
type LoadingState = 'initial' | 'skeleton' | 'ready' | 'error';
const loadingState = ref<LoadingState>('initial');
const skeletonTimer = window.setTimeout(() => {
  if (loadingState.value === 'initial') {
    loadingState.value = 'skeleton';
  }
}, SKELETON_DELAY_MS);
// Deferred removal so a setup() error before mount doesn't wipe the stored value.
onMounted(() => sessionStorage.removeItem(SESSION_STORAGE_SEARCH_KEY));
onDeactivated(() => clearTimeout(skeletonTimer));
onUnmounted(() => clearTimeout(skeletonTimer));
const variationsAsTricks = computed(() => getShowVariationsAsTricks());
const includedStatusesParam = computed(() => getIncludedStatuses());
const showFavoritesAtTopParam = computed(() => getShowFavoritesAtTop());
const preferredNameParam = computed(() => getPreferredName());

// Cached locally so search/sort/group can re-run without hitting IndexedDB on
// every keystroke — see issue #430. Refreshed on mount, on KeepAlive
// reactivation, and after writes that mutate the trick set elsewhere.
// shallowRef so Trick proxy classes aren't deep-wrapped (private fields don't
// survive Vue's reactivity unwrap, and the per-trick proxy already controls
// its own mutations).
const allTricks = shallowRef<Trick[]>([]);
const hasLoadedOnce = ref(false);

const searchResult = computed<SearchResult>(() =>
  searchInTricks(
    allTricks.value,
    {
      searchText: searchTextDebounced.value,
      sortOrder: sortOrder.value,
      includedStatuses: includedStatusesParam.value,
      showFavoritesAtTop: showFavoritesAtTopParam.value,
      preferredName: preferredNameParam.value,
    },
    trickToAttribute,
    t('sectionTitles.favorites'),
    variationsAsTricks.value
  )
);

const variationsMap = computed<Map<string, SearchItem[]>>(() => {
  if (variationsAsTricks.value) return new Map();
  return buildVariationsMap(
    allTricks.value,
    searchResult.value,
    preferredNameParam.value,
    includedStatusesParam.value
  );
});

const countSummary = computed(() =>
  buildCountSummary(
    allTricks.value,
    searchResult.value,
    includedStatusesParam.value,
    variationsAsTricks.value,
    !!searchTextDebounced.value
  )
);
type SectionView = {
  id: string;
  title: string;
  items: SearchItem[];
  isCollapsible: boolean;
  isOpen: boolean;
  showVariations: boolean;
};

function getSectionStorageId(section: SearchSection): string {
  if (section.title === t('sectionTitles.favorites')) {
    return 'favorites';
  }

  if (searchTextDebounced.value) {
    return `search:${searchTextDebounced.value}`;
  }

  // Use the section title directly for stable section IDs
  // This prevents section ID changes when sorting changes
  return `${sortOrder.value}:${section.title}`;
}

function isFavoritesSection(section: SearchSection): boolean {
  return section.title === t('sectionTitles.favorites');
}

const visibleSections = computed<SectionView[]>(() =>
  searchResult.value.map((section) => {
    const isCollapsible = !searchTextDebounced.value;
    const sectionId = getSectionStorageId(section);
    return {
      id: sectionId,
      title: section.title,
      items: section.items,
      isCollapsible,
      isOpen: isCollapsible ? isSectionOpen(sectionId) : true,
      showVariations: !searchTextDebounced.value && !isFavoritesSection(section),
    };
  })
);

function buildVariationsMap(
  allTricks: Trick[],
  result: SearchResult,
  preferredName: SearchParameters['preferredName'],
  includedStatuses: string[]
): Map<string, SearchItem[]> {
  const map = new Map<string, SearchItem[]>();
  for (const section of result) {
    for (const item of section.items) {
      const variations = getVariationsForTrick(
        allTricks,
        item.primaryKey[0],
        item.primaryKey[1],
        includedStatuses
      );
      if (variations.length === 0) continue;
      const variationItems: SearchItem[] = variations.map((variation) => ({
        name:
          preferredName === 'alias'
            ? variation.alias ?? variation.technicalName
            : variation.technicalName,
        primaryKey: [...variation.primaryKey],
        stickFrequency: variation.stickFrequency,
        isFavorite: variation.isFavorite,
        isNew:
          variation.primaryKey[1] !== 'userDefined' && isStickableNew(variation.dateAddedEpoch),
      }));
      map.set(`${item.primaryKey[1]}:${item.primaryKey[0]}`, variationItems);
    }
  }
  return map;
}

function trickToAttribute(trick: Trick, sortOption: SortOrder): string {
  switch (sortOption) {
    case 'difficulty-asc':
    case 'difficulty-desc':
      return trick.difficultyLevel
        ? t('sectionTitles.difficulty', { difficulty: trick.difficultyLevel })
        : t('sectionTitles.notDetermined');
    case 'startPos':
      return trick.startPosition ? t(trick.startPosition) : t('sectionTitles.unknown');
    case 'endPos':
      return trick.endPosition ? t(trick.endPosition) : t('sectionTitles.unknown');
    case 'yearEstablished-asc':
    case 'yearEstablished-desc':
      return trick.yearEstablished ? trick.yearEstablished.toString() : t('sectionTitles.unknown');
  }
}

let isLoadingTricks = false;
async function loadTricks() {
  if (isLoadingTricks) return;
  isLoadingTricks = true;
  // Show skeleton immediately when retrying after an error (timer already fired).
  if (loadingState.value === 'error') loadingState.value = 'skeleton';
  try {
    const fetched = await tricksDao.getAll();
    allTricks.value = fetched;
    hasLoadedOnce.value = true;

    // On a fresh install the official sync is still populating the DB, so an
    // empty result here doesn't mean "no tricks" — keep the skeleton up; App
    // will remount this view once the sync finishes.
    const stillBootstrapping = fetched.length === 0 && isOfficialSyncing.value;
    if (!stillBootstrapping && loadingState.value !== 'ready') {
      loadingState.value = 'ready';
      clearTimeout(skeletonTimer);
    }
  } catch (err) {
    console.error('[TrickList] Failed to load tricks', err);
    // Don't clobber valid data with an error banner on background refreshes.
    if (loadingState.value !== 'ready') {
      loadingState.value = 'error';
      clearTimeout(skeletonTimer);
    }
  } finally {
    isLoadingTricks = false;
  }
}

watch(sortOrder, (val) => localStorage.setItem(LOCAL_STORAGE_SORT_KEY, val));

loadTricks();

function linkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}

onBeforeRouteLeave(() => {
  sessionStorage.setItem(SESSION_STORAGE_SCROLL_KEY, String(window.scrollY));
  if (searchText.value) {
    sessionStorage.setItem(SESSION_STORAGE_SEARCH_KEY, searchText.value);
  } else {
    sessionStorage.removeItem(SESSION_STORAGE_SEARCH_KEY);
  }
});

async function restoreScroll() {
  const stored = sessionStorage.getItem(SESSION_STORAGE_SCROLL_KEY);
  if (!stored) return;
  sessionStorage.removeItem(SESSION_STORAGE_SCROLL_KEY);
  const y = Number(stored);
  if (Number.isNaN(y)) return;
  await nextTick();
  requestAnimationFrame(() => window.scrollTo(0, y));
}

// First-mount path: data isn't ready immediately, so wait for it before scrolling.
const stopScrollRestore = watch(hasLoadedOnce, () => {
  if (!hasLoadedOnce.value) return;
  stopScrollRestore();
  restoreScroll();
});

// Cached-mount path (KeepAlive activation after returning from TrickDetails):
// the DOM is already populated, so scroll can be restored straight away. Also
// kick off a background refresh in case data changed while away (e.g. user
// favorited a trick on the detail page).
let isFirstActivation = true;
onActivated(() => {
  if (isFirstActivation) {
    isFirstActivation = false;
    return; // initial mount path is handled by the watcher above
  }
  if (hasLoadedOnce.value) restoreScroll();
  loadTricks();
});
</script>

<template>
  <DefaultLayout>
    <Header>
      <img :src="ImgLogoUrl" class="h-10 max-w-full object-contain mx-auto" alt="Logo" />
      <template #buttonsRight>
        <TrickFilterPopover
          v-model:sort-order="sortOrder"
          v-model:open="isFilterPopoverOpen"
          :sort-disabled="!!searchTextDebounced"
        />
        <Button size="icon" variant="ghost" as-child>
          <RouterLink to="/settings" :aria-label="t('settings')">
            <Icon icon="ic:round-settings" class="h-6 w-6 text-foreground" />
          </RouterLink>
        </Button>
      </template>
    </Header>
    <Section>
      <TrickSearchMenu
        v-model:search-text="searchText"
        :trick-count="countSummary.trickCount"
        :variation-count="countSummary.variationCount"
        :total-count="countSummary.totalCount"
        :variations-as-tricks="variationsAsTricks"
        :show-breakdown="countSummary.showBreakdown"
        :is-loading="loadingState === 'skeleton'"
      />
    </Section>

    <Separator />

    <Section>
      <TrickListSkeleton v-if="loadingState === 'skeleton'" />
      <ErrorInfo
        v-else-if="loadingState === 'error'"
        :title="t('info.loadFailed')"
        :description="t('info.loadFailedDescription')"
      />
      <div v-else-if="loadingState === 'ready'" class="w-full flex flex-col gap-2">
        <!-- No Search Results-->
        <div v-if="searchResult.length === 0" class="text-xl text-center mt-3">
          {{
            searchTextDebounced ? t('info.noTrickMatchingSearch') : t('info.noTricksCheckSettings')
          }}
          <div class="flex flex-row justify-center mt-3">
            <img
              :src="ImgArmsCrossedUrl"
              class="h-full md:w-auto max-h-72 sm:max-h-80 xl:max-h-96 p-3 pb-7 sm:py-4 md:pb-3"
            />
          </div>
        </div>

        <Collapsible
          v-for="section in visibleSections"
          :key="section.id"
          :open="section.isOpen"
          :disabled="!section.isCollapsible"
          class="w-full flex flex-col"
          :class="{ 'gap-1': section.isOpen }"
          @update:open="(open: boolean) => toggleSection(section.id, open)"
        >
          <CollapsibleTrigger as-child>
            <button
              class="text-2xl font-medium px-3 w-full grid grid-cols-[1fr_auto_1fr] items-center rounded-md"
              :class="{
                'cursor-pointer hover:bg-accent/50 transition-colors': section.isCollapsible,
                'cursor-default': !section.isCollapsible,
              }"
            >
              <span />
              <span>{{ section.title }}</span>
              <span class="flex items-center gap-1 justify-self-end">
                <span class="text-sm text-muted-foreground font-normal">
                  {{ section.items.length }}
                </span>
                <Icon
                  v-if="section.isCollapsible"
                  icon="ic:round-keyboard-arrow-down"
                  class="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground"
                  :class="{ 'rotate-180': !section.isOpen }"
                />
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 w-full grid-flow-row-dense"
            >
              <StickableSearchResult
                v-for="item in section.items"
                :key="item.primaryKey[1] + ':' + item.primaryKey[0]"
                :title="item.name"
                :status="item.primaryKey[1]"
                :stick-frequency="item.stickFrequency"
                :is-favorite="item.isFavorite"
                :is-new="item.isNew"
                :link-to-details="linkToDetails(item.primaryKey)"
                :variations="variationsMap.get(item.primaryKey[1] + ':' + item.primaryKey[0]) || []"
                :showVariations="section.showVariations"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Section>

    <div
      v-if="isFilterPopoverOpen"
      class="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
      aria-hidden="true"
    />

    <!-- Floating Add-New-Trick-Menu -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          size="icon"
          class="rounded-full shadow-md fixed bottom-5 right-3 lg:right-5 xl:bottom-10 xl:right-10 h-12 w-12 z-30"
        >
          <Icon icon="ic:round-add" class="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <RouterLink to="/tricks/new" class="flex flex-row">
            <Icon icon="ic:round-person" class="h-6 w-6 mr-2" />
            {{ t('newTrickButton.personal') }}
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <a
            href="https://forms.gle/kCPLnDz9xNLW9oKAA"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-row underline"
          >
            <Icon icon="material-symbols:globe-asia" class="h-6 w-6 mr-2" />
            {{ t('newTrickButton.official') }}
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </DefaultLayout>
</template>
