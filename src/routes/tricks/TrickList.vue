<script lang="ts" setup>
import { ref, watch, provide } from 'vue';
import { tricksDao } from '@/lib/database';
import { PrimaryKey } from '@/lib/utils';
import { SearchItem, SearchParameters, SearchResult, SortOrder } from '@/types/search';
import { Trick } from '@/lib/database/daos/trick';
import { searchInTricks, getVariationsForTrick } from '@/services/searchAndFilterTricks';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import TrickSearchMenu from '@/components/stickable/list/TrickSearchMenu.vue';
import StickableSearchResult from '@/components/stickable/list/StickableSearchResult.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Section from '@/components/ui/section/Section.vue';
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
import {
  OpenCollapsibleIdKey,
  PendingOpenCollapsibleIdKey,
} from '@/components/stickable/list/OpenCollapsibleId';
import { isStickableNew } from '@/util/misc';

const i18n = useI18n({
  messages: i18nMerge(messages_list, messages_positions),
  scope: 'local',
});
const { t } = i18n;

const LOCAL_STORAGE_PARAMETERS_KEY: string = 'SearchParameters-Tricks';
const DEFAULT_SEARCH_PARAMETERS: SearchParameters = {
  sortOrder: 'difficulty-asc',
  includedStatuses: ['official', 'userDefined', 'archived'],
  showFavoritesAtTop: true,
  preferredName: 'alias',
};

function loadSearchParameters(): SearchParameters {
  const parametersAsString = window.localStorage.getItem(LOCAL_STORAGE_PARAMETERS_KEY);
  if (!parametersAsString) {
    return DEFAULT_SEARCH_PARAMETERS;
  }

  const parameters = JSON.parse(parametersAsString);
  parameters.sortOrder = parameters.sortOrder || DEFAULT_SEARCH_PARAMETERS.sortOrder;
  parameters.includedStatuses =
    parameters.includedStatuses || DEFAULT_SEARCH_PARAMETERS.includedStatuses;
  parameters.showFavoritesAtTop =
    parameters.showFavoritesAtTop || DEFAULT_SEARCH_PARAMETERS.showFavoritesAtTop;
  parameters.preferredName = parameters.preferredName || DEFAULT_SEARCH_PARAMETERS.preferredName;

  return parameters;
}

function storeSearchParameters(parameters: SearchParameters) {
  const parametersAsString = JSON.stringify(parameters);
  window.localStorage.setItem(LOCAL_STORAGE_PARAMETERS_KEY, parametersAsString);
}

const searchParameters = ref<SearchParameters>(loadSearchParameters());
const searchResult = ref<SearchResult>();
const variationsMap = ref<Map<string, SearchItem[]>>(new Map());
const openCollapsibleId = ref<string | null>(null);
const pendingOpenCollapsibleId = ref<string | null>(null);

provide(OpenCollapsibleIdKey, openCollapsibleId);
provide(PendingOpenCollapsibleIdKey, pendingOpenCollapsibleId);

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
  [searchParameters, i18n.locale],
  async () => {
    const allTricks = await tricksDao.getAll();
    searchResult.value = searchInTricks(
      allTricks,
      searchParameters.value,
      trickToAttribute,
      t('sectionTitles.favorites')
    );

    // Build variations map for displayed tricks
    const newVariationsMap = new Map<string, SearchItem[]>();
    searchResult.value?.forEach((section) => {
      section.items.forEach((item) => {
        const variations = getVariationsForTrick(
          allTricks,
          item.primaryKey[0],
          item.primaryKey[1],
          searchParameters.value.includedStatuses
        );
        if (variations.length == 0) return;
        const variationItems = variations.map(
          (variation) =>
            ({
              name:
                searchParameters.value.preferredName === 'alias'
                  ? variation.alias ?? variation.technicalName
                  : variation.technicalName,
              primaryKey: variation.primaryKey,
              stickFrequency: variation.stickFrequency,
              isFavorite: variation.isFavourite,
              isNew: isStickableNew(variation.dateAddedEpoch),
            }) as SearchItem
        );
        newVariationsMap.set(`${item.primaryKey[1]}:${item.primaryKey[0]}`, variationItems);
      });
    });
    variationsMap.value = newVariationsMap;

    storeSearchParameters(searchParameters.value);
  },
  { immediate: true, deep: true }
);

const totalTrickCount = computed(() => {
  if (!searchResult.value) return 0;
  const seen = new Set<string>();
  for (const section of searchResult.value) {
    for (const item of section.items) {
      seen.add(`${item.primaryKey[1]}:${item.primaryKey[0]}`);
    }
  }
  return seen.size;
});

function linkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <DefaultLayout>
    <Section>
      <TrickSearchMenu :search-parameters="searchParameters" :trick-count="totalTrickCount" />
    </Section>

    <Separator />

    <Section>
      <div class="w-full flex flex-col gap-5">
        <!-- No Search Results-->
        <div v-if="!searchResult || searchResult.length == 0" class="text-xl text-center mt-3">
          {{ t('info.noTrickMatchingSearch') }}
          <div class="flex flex-row justify-center mt-3">
            <img
              :src="ImgArmsCrossedUrl"
              class="h-full md:w-auto max-h-72 sm:max-h-80 xl:max-h-96 p-3 pb-7 sm:py-4 md:pb-3"
            />
          </div>
        </div>

        <!-- Search Results-->
        <div
          v-for="section in searchResult"
          class="w-full flex flex-col gap-1"
          :key="section.title"
        >
          <div class="text-2xl font-medium px-3 w-full text-center">{{ section.title }}</div>
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
              :showVariations="
                !searchParameters.searchText && section.title !== t('sectionTitles.favorites')
              "
            />
          </div>
        </div>
      </div>
    </Section>

    <!-- Floating Add-New-Trick-Menu -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          size="icon"
          class="rounded-full shadow-md fixed bottom-5 right-3 lg:right-5 xl:bottom-10 xl:right-10 h-12 w-12"
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
