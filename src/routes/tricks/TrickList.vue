<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { tricksDao } from '@/lib/database';
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
import TrickSearchMenu from '@/components/stickable/list/TrickSearchMenu.vue';
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

import { useI18n } from 'vue-i18n';
import { i18nMerge } from '@/i18n/i18nmerge';
import messages_list from '@/i18n/list';
import messages_positions from '@/i18n/common/positions';
import { isStickableNew } from '@/util/misc';
import { buildCountSummary } from './trickListCountSummary';

const i18n = useI18n({
  messages: i18nMerge(messages_list, messages_positions),
  scope: 'local',
});
const { t } = i18n;

const LOCAL_STORAGE_SORT_KEY = 'SearchParameters-Tricks-SortOrder';
const LOCAL_STORAGE_COLLAPSED_SECTIONS_KEY = 'TrickList-CollapsedSections';

function loadSortOrder(): SortOrder {
  return (localStorage.getItem(LOCAL_STORAGE_SORT_KEY) as SortOrder) || 'difficulty-asc';
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

const searchText = ref<string | undefined>(undefined);
const sortOrder = ref<SortOrder>(loadSortOrder());
const variationsAsTricks = computed(() => getShowVariationsAsTricks());
const searchResult = ref<SearchResult>();
const variationsMap = ref<Map<string, SearchItem[]>>(new Map());
const tricksByPrimaryKey = ref<Map<string, Trick>>(new Map());
const countSummary = ref(buildCountSummary([], [], [], false, false));
type SectionView = {
  id: string;
  title: string;
  items: SearchItem[];
  isCollapsible: boolean;
  isOpen: boolean;
  showVariations: boolean;
};

function getPrimaryKeyString(primaryKey: Readonly<PrimaryKey>): string {
  return `${primaryKey[1]}:${primaryKey[0]}`;
}

function getSectionStorageId(section: SearchSection): string {
  if (section.title === t('sectionTitles.favorites')) {
    return 'favorites';
  }

  if (searchText.value) {
    return `search:${searchText.value}`;
  }

  const firstItem = section.items[0];
  const trick = firstItem
    ? tricksByPrimaryKey.value.get(getPrimaryKeyString(firstItem.primaryKey))
    : null;
  if (!trick) {
    return `${sortOrder.value}:${section.title}`;
  }

  switch (sortOrder.value) {
    case 'difficulty-asc':
    case 'difficulty-desc':
      return `difficulty:${trick.difficultyLevel ?? 'unknown'}`;
    case 'startPos':
      return `startPos:${trick.startPosition || 'unknown'}`;
    case 'endPos':
      return `endPos:${trick.endPosition || 'unknown'}`;
    case 'yearEstablished-asc':
    case 'yearEstablished-desc':
      return `yearEstablished:${trick.yearEstablished ?? 'unknown'}`;
  }
}

function isFavoritesSection(section: SearchSection): boolean {
  return section.title === t('sectionTitles.favorites');
}

const visibleSections = computed<SectionView[]>(() =>
  (searchResult.value ?? []).map((section) => {
    const isCollapsible = !searchText.value;
    const sectionId = getSectionStorageId(section);
    return {
      id: sectionId,
      title: section.title,
      items: section.items,
      isCollapsible,
      isOpen: isCollapsible ? isSectionOpen(sectionId) : true,
      showVariations: !searchText.value && !isFavoritesSection(section),
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
        isFavorite: variation.isFavourite,
        isNew: isStickableNew(variation.dateAddedEpoch),
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

watch(
  [searchText, sortOrder, variationsAsTricks, i18n.locale],
  async () => {
    const allTricks = await tricksDao.getAll();
    const includedStatuses = getIncludedStatuses();
    const preferredName = getPreferredName();
    tricksByPrimaryKey.value = new Map(
      allTricks.map((trick) => [getPrimaryKeyString(trick.primaryKey), trick])
    );

    const params: SearchParameters = {
      searchText: searchText.value,
      sortOrder: sortOrder.value,
      includedStatuses,
      showFavoritesAtTop: getShowFavoritesAtTop(),
      preferredName,
    };

    searchResult.value = searchInTricks(
      allTricks,
      params,
      trickToAttribute,
      t('sectionTitles.favorites'),
      variationsAsTricks.value
    );

    countSummary.value = buildCountSummary(
      allTricks,
      searchResult.value,
      includedStatuses,
      variationsAsTricks.value,
      !!searchText.value
    );

    variationsMap.value =
      searchResult.value && !variationsAsTricks.value
        ? buildVariationsMap(allTricks, searchResult.value, preferredName, includedStatuses)
        : new Map<string, SearchItem[]>();

    localStorage.setItem(LOCAL_STORAGE_SORT_KEY, sortOrder.value);
  },
  { immediate: true, deep: true }
);

function linkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <DefaultLayout>
    <Section>
      <TrickSearchMenu
        v-model:search-text="searchText"
        v-model:sort-order="sortOrder"
        :trick-count="countSummary.trickCount"
        :variation-count="countSummary.variationCount"
        :total-count="countSummary.totalCount"
        :variations-as-tricks="variationsAsTricks"
        :show-breakdown="countSummary.showBreakdown"
      />
    </Section>

    <Separator />

    <Section>
      <div class="w-full flex flex-col gap-2">
        <!-- No Search Results-->
        <div v-if="!searchResult || searchResult.length === 0" class="text-xl text-center mt-3">
          {{ searchText ? t('info.noTrickMatchingSearch') : t('info.noTricksCheckSettings') }}
          <div class="flex flex-row justify-center mt-3">
            <img
              :src="ImgArmsCrossedUrl"
              class="h-full md:w-auto max-h-72 sm:max-h-80 xl:max-h-96 p-3 pb-7 sm:py-4 md:pb-3"
            />
          </div>
        </div>

        <!-- Search Results-->
        <template v-if="searchText">
          <div
            v-for="section in visibleSections"
            :key="section.id"
            class="w-full flex flex-col gap-1"
          >
            <div
              class="text-2xl font-medium px-3 w-full grid grid-cols-[1fr_auto_1fr] items-center"
            >
              <span />
              <span>{{ section.title }}</span>
              <span class="flex items-center gap-1 justify-self-end">
                <span class="text-sm text-muted-foreground font-normal">
                  {{ section.items.length }}
                </span>
              </span>
            </div>
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
          </div>
        </template>

        <Collapsible
          v-else
          v-for="section in visibleSections"
          :key="section.id"
          :open="section.isOpen"
          class="w-full flex flex-col"
          :class="{ 'gap-1': section.isOpen }"
          @update:open="(open: boolean) => toggleSection(section.id, open)"
        >
          <CollapsibleTrigger as-child>
            <button
              class="text-2xl font-medium px-3 w-full grid grid-cols-[1fr_auto_1fr] items-center cursor-pointer rounded-md hover:bg-accent/50 transition-colors"
            >
              <span />
              <span>{{ section.title }}</span>
              <span class="flex items-center gap-1 justify-self-end">
                <span class="text-sm text-muted-foreground font-normal">
                  {{ section.items.length }}
                </span>
                <Icon
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
