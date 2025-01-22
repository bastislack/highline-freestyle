<script lang="ts" setup>
import { ref, watch } from 'vue';
import { tricksDao } from '@/lib/database';
import { PrimaryKey } from '@/lib/utils';
import { SearchParameters, SearchResult, SortOrder } from '@/types/search';
import { Trick } from '@/lib/database/daos/trick';
import { searchInTricks } from '@/services/searchAndFilterTricks';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import TrickSearchMenu from '@/components/stickable/list/TrickSearchMenu.vue';
import StickableOverviewCard from '@/components/stickable/list/StickableOverviewCard.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Section from '@/components/ui/section/Section.vue';

import { useI18n } from 'vue-i18n';
import { i18nMerge } from '@/i18n/i18nmerge';
import messages_list from '@/i18n/list';
import messages_positions from '@/i18n/common/positions';

const i18n = useI18n({
  messages: i18nMerge(messages_list, messages_positions),
  scope: 'local',
});
const { t } = i18n;

const LOCAL_STORAGE_PARAMETERS_KEY: string = 'SearchParameters-Tricks';
const DEFAULT_SEARCH_PARAMETERS: SearchParameters = { sortOrder: 'difficulty-asc' };

function loadSearchParameters(): SearchParameters {
  const parametersAsString = window.localStorage.getItem(LOCAL_STORAGE_PARAMETERS_KEY);
  if (!parametersAsString) {
    return DEFAULT_SEARCH_PARAMETERS;
  }
  return JSON.parse(parametersAsString);
}

function storeSearchParameters(parameters: SearchParameters) {
  const parametersAsString = JSON.stringify(parameters);
  window.localStorage.setItem(LOCAL_STORAGE_PARAMETERS_KEY, parametersAsString);
}

const searchParameters = ref<SearchParameters>(loadSearchParameters());
const searchResult = ref<SearchResult>();

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
    searchResult.value = searchInTricks(allTricks, searchParameters.value, trickToAttribute);
    storeSearchParameters(searchParameters.value);
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
      <TrickSearchMenu :search-parameters="searchParameters" />
    </Section>

    <Separator />

    <Section>
      <div class="w-full flex flex-col gap-5">
        <div
          v-for="section in searchResult"
          class="w-full flex flex-col gap-1"
          :key="section.title"
        >
          <div class="text-lg font-medium px-3 w-full text-center">{{ section.title }}</div>
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 w-full">
            <StickableOverviewCard
              v-for="item in section.items"
              :key="item.primaryKey[1] + ':' + item.primaryKey[0]"
              :title="item.name"
              :status="item.primaryKey[1]"
              :stick-frequency="item.stickFrequency"
              :is-favorite="item.isFavorite"
              :is-new="item.isNew"
              :link-to-details="linkToDetails(item.primaryKey)"
            />
          </div>
        </div>
      </div>
    </Section>
  </DefaultLayout>
</template>
