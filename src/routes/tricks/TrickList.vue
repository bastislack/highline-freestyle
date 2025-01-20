<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { tricksDao } from '@/lib/database';
import { Trick } from '@/lib/database/daos/trick';
import { PrimaryKey } from '@/lib/utils';
import { ref, watchEffect } from 'vue';
import { isStickableNew } from '@/util/misc';
import StickableOverviewCard from '@/components/stickable/StickableOverviewCard.vue';
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

type SortOrder =
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'startPos'
  | 'endPos'
  | 'yearEstablished-asc'
  | 'yearEstablished-desc';

function comparePrimaryKey(a: Trick, b: Trick): number {
  const statusOrder = ['official', 'userDefined', 'archived'];
  const statusDiff = statusOrder.indexOf(a.primaryKey[1]) - statusOrder.indexOf(b.primaryKey[1]);
  return statusDiff || a.primaryKey[0] - b.primaryKey[0];
}

function compareDifficulty(a: Trick, b: Trick): number {
  const difficultyA = a.difficultyLevel || Number.MAX_VALUE;
  const difficultyB = b.difficultyLevel || Number.MAX_VALUE;
  return difficultyA - difficultyB;
}

function compareLowerCaseString(a: string, b: string): number {
  if (a.toLowerCase() < b.toLowerCase()) return -1;
  if (a.toLowerCase() > b.toLowerCase()) return 1;
  return 0;
}

function compareStartPosition(a: Trick, b: Trick): number {
  return compareLowerCaseString(a.startPosition, b.startPosition);
}

function compareEndPosition(a: Trick, b: Trick): number {
  return compareLowerCaseString(a.endPosition, b.endPosition);
}

function compareYearEstablished(a: Trick, b: Trick): number {
  const yearEstablishedA: number = a.yearEstablished ?? Number.MAX_VALUE;
  const yearEstablishedB: number = b.yearEstablished ?? Number.MAX_VALUE;
  return yearEstablishedA - yearEstablishedB;
}

function capitalizeAllWords(s: string) {
  return s
    .toLowerCase()
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(' ');
}

function getParameterForSortOption(trick: Trick, sortOption: SortOrder): string {
  switch (sortOption) {
    case 'difficulty-asc':
    case 'difficulty-desc':
      return trick.difficultyLevel ? `Difficulty ${trick.difficultyLevel}` : 'Not determined';
    case 'startPos':
      return trick.startPosition ? capitalizeAllWords(trick.startPosition) : 'Unknown';
    case 'endPos':
      return trick.endPosition ? capitalizeAllWords(trick.endPosition) : 'Unknown';
    case 'yearEstablished-asc':
    case 'yearEstablished-desc':
      return trick.yearEstablished ? trick.yearEstablished.toString() : 'Unknown';
  }
}

function sortTricks(tricks: Trick[], sorting: SortOrder): Trick[] {
  switch (sorting) {
    case 'difficulty-asc':
      return tricks.sort((a, b) => compareDifficulty(a, b) || comparePrimaryKey(a, b));
    case 'difficulty-desc':
      return tricks.sort((a, b) => -compareDifficulty(a, b) || comparePrimaryKey(a, b));
    case 'startPos':
      return tricks.sort((a, b) => compareStartPosition(a, b) || comparePrimaryKey(a, b));
    case 'endPos':
      return tricks.sort((a, b) => compareEndPosition(a, b) || comparePrimaryKey(a, b));
    case 'yearEstablished-asc':
      return tricks.sort((a, b) => compareYearEstablished(a, b) || comparePrimaryKey(a, b));
    case 'yearEstablished-desc':
      return tricks.sort((a, b) => -compareYearEstablished(a, b) || comparePrimaryKey(a, b));
  }
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

function groupTricksToSearchResult(sortedTricks: Trick[], sorting: SortOrder): SearchResult {
  let currentGroup = getParameterForSortOption(sortedTricks[0], sorting);
  let result: SearchResult = [{ title: currentGroup, items: [] }];

  for (let trick of sortedTricks) {
    if (getParameterForSortOption(trick, sorting) !== currentGroup) {
      currentGroup = getParameterForSortOption(trick, sorting);
      result.push({ title: currentGroup, items: [] });
    }
    const searchItem = searchItemFromTrick(trick);
    result[result.length - 1].items.push(searchItem);
  }
  return result;
}

async function search(sorting: SortOrder): Promise<SearchResult> {
  const allTricks = await tricksDao.getAll();
  const sortedTricks = sortTricks(allTricks, sorting);
  return groupTricksToSearchResult(sortedTricks, sorting);
}

const searchResult = ref<SearchResult>();

const activeSortingOption = ref<SortOrder>('difficulty-asc');

const sortingOptions = [
  { title: 'Difficulty', directionTitle: 'Up', value: 'difficulty-asc' },
  { title: 'Difficulty', directionTitle: 'Down', value: 'difficulty-desc' },
  { title: 'Start Position', value: 'startPos' },
  { title: 'End Position', value: 'endPos' },
  { title: 'Invention year', directionTitle: 'Up', value: 'yearEstablished-asc' },
  { title: 'Invention year', directionTitle: 'Down', value: 'yearEstablished-desc' },
];

watchEffect(async () => {
  searchResult.value = await search(activeSortingOption.value);
});

function linkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <DefaultLayout>
    <div class="flex flex-row gap-1 w-full h-fit p-2 my-2">
      <div class="grow">
        <Input placeholder="Search" />
      </div>

      <div class="w-[175px] flex-initial">
        <Select v-model="activeSortingOption">
          <SelectTrigger class="w-[175px] grow-0 shrink-0">
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
