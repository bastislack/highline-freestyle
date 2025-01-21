<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { tricksDao } from '@/lib/database';
import { PrimaryKey } from '@/lib/utils';
import { ref, watch } from 'vue';
import StickableOverviewCard from '@/components/stickable/list/StickableOverviewCard.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { SearchParameters, SearchResult } from '@/types/search';
import TrickSearchMenu from '@/components/stickable/list/TrickSearchMenu.vue';
import { searchInTricks } from '@/services/searchAndFilterTricks';

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

watch(
  searchParameters,
  async () => {
    const allTricks = await tricksDao.getAll();
    searchResult.value = searchInTricks(allTricks, searchParameters.value);
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
    <TrickSearchMenu :search-parameters="searchParameters" />

    <Separator class="mb-2" />

    <div class="w-full flex flex-col gap-5">
      <div v-for="section in searchResult" class="w-full flex flex-col gap-1" :key="section.title">
        <div class="text-lg font-medium px-3 w-full text-center">{{ section.title }}</div>
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-2 w-full">
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
  </DefaultLayout>
</template>
