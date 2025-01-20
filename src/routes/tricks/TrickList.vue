<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { tricksDao } from '@/lib/database';
import { Trick } from '@/lib/database/daos/trick';
import { PrimaryKey } from '@/lib/utils';
import { ref, watchEffect } from 'vue';
import { isStickableNew } from '@/util/misc';
import OverviewCard from '@/components/stickable/OverviewCard.vue';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Separator from '@/components/ui/separator/Separator.vue';

type SearchResult = SearchSection[];

type SearchSection = {
  title: string;
  items: SearchItem[];
};

type SearchItem = {
  name: string;
  primaryKey: PrimaryKey;
  stickFrequency?: number;
  isNew: boolean;
  isFavorite: boolean;
};

function comparePrimaryKey(a: Trick, b: Trick): number {
  const statusOrder = ['official', 'userDefined', 'archived'];
  const statusDiff = statusOrder.indexOf(a.primaryKey[1]) - statusOrder.indexOf(b.primaryKey[1]);
  return statusDiff || a.primaryKey[0] - b.primaryKey[0];
}

function compareDifficulty(a: Trick, b: Trick): number {
  const difficultyA = a.difficultyLevel || Number.MAX_VALUE;
  const difficultyB = b.difficultyLevel || Number.MAX_VALUE;
  return difficultyA - difficultyB || comparePrimaryKey(a, b);
}

function getParameter(trick: Trick, parameter: 'difficulty'): string {
  if (parameter === 'difficulty') {
    return trick.difficultyLevel ? `Difficulty ${trick.difficultyLevel}` : 'Not determined';
  }
  return '';
}

function searchItemFromTrick(trick: Trick): SearchItem {
  return {
    name: trick.alias ?? trick.technicalName,
    primaryKey: [trick.primaryKey[0], trick.primaryKey[1]],
    stickFrequency: trick.stickFrequency,
    isFavorite: trick.isFavourite,
    isNew: isStickableNew(trick.dateAddedEpoch),
  };
}

async function search(): Promise<SearchResult> {
  const allTricks = (await tricksDao.getAll()).sort((a, b) => compareDifficulty(a, b));

  let currentGroup = getParameter(allTricks[0], 'difficulty');
  let result: SearchResult = [{ title: currentGroup, items: [] }];

  for (let trick of allTricks) {
    if (getParameter(trick, 'difficulty') !== currentGroup) {
      currentGroup = getParameter(trick, 'difficulty');
      result.push({ title: currentGroup, items: [] });
    }
    const searchItem = searchItemFromTrick(trick);
    result[result.length - 1].items.push(searchItem);
  }

  return result;
}

const searchResult = ref<SearchResult>();

watchEffect(async () => {
  searchResult.value = await search();
});

function linkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}

const selectValue = ref('difficulty-asc');

const sortingOptions = [
  { title: 'Difficulty', directionTitle: 'Up', value: 'difficulty-asc' },
  { title: 'Difficulty', directionTitle: 'Down', value: 'difficulty-desc' },
  { title: 'Start Position', value: 'startPos' },
  { title: 'End Position', value: 'endPos' },
  { title: 'Invention year', directionTitle: 'Up', value: 'yearEstablished-asc' },
  { title: 'Invention year', directionTitle: 'Down', value: 'yearEstablished-desc' },
];
</script>

<template>
  <DefaultLayout>
    <div class="flex flex-row gap-1 w-full h-fit p-2 my-2">
      <div class="grow">
        <Input placeholder="Search" />
      </div>

      <div class="w-[170px] flex-initial">
        <Select v-model="selectValue">
          <SelectTrigger class="w-[170px] grow-0 shrink-0">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sorting</SelectLabel>
              <SelectItem
                v-for="option in sortingOptions"
                :value="option.value"
                :key="option.value"
              >
                {{ option.title }}
                <span v-if="option.directionTitle" class="text-muted-foreground">{{
                  option.directionTitle
                }}</span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <Separator class="mb-2" />

    <div class="w-full flex flex-col gap-5">
      <div v-for="section in searchResult" class="w-full flex flex-col gap-1" :key="section.title">
        <div class="text-lg font-medium px-3 w-full text-center">{{ section.title }}</div>
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-2 w-full">
          <OverviewCard
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
