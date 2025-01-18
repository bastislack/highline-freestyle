<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { tricksDao } from '@/lib/database';
import { Trick } from '@/lib/database/daos/trick';
import { PrimaryKey } from '@/lib/utils';
import { ref, watchEffect } from 'vue';
import { isStickableNew } from '@/util/misc';
import OverviewCard from '@/components/stickable/OverviewCard.vue';

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

function sortByPrimaryKeyCondition(a: Trick, b: Trick): number {
  const statusOrder = ['official', 'userDefined', 'archived'];
  const statusDiff = statusOrder.indexOf(a.primaryKey[1]) - statusOrder.indexOf(b.primaryKey[1]);

  if (statusDiff !== 0) {
    return statusDiff;
  }

  return a.primaryKey[0] - b.primaryKey[0];
}

function sortByDifficultyAscendingCondition(a: Trick, b: Trick): number {
  let comp = 0;
  if (a.difficultyLevel !== undefined && b.difficultyLevel !== undefined) {
    comp = a.difficultyLevel - b.difficultyLevel;
  } else if (a.difficultyLevel === undefined) {
    comp = b.difficultyLevel === undefined ? 0 : 1;
  } else {
    comp = -1;
  }

  if (comp == 0) {
    return sortByPrimaryKeyCondition(a, b);
  }

  return comp;
}

function getParameter(trick: Trick, parameter: 'difficulty'): string {
  if (parameter === 'difficulty') {
    return trick.difficultyLevel ? `Difficulty ${trick.difficultyLevel}` : 'Not determined';
  }
  return '';
}

async function search(): Promise<SearchResult> {
  const allTricks = (await tricksDao.getAll()).sort((a, b) =>
    sortByDifficultyAscendingCondition(a, b)
  );
  let currentGroup = getParameter(allTricks[0], 'difficulty');
  let result: SearchResult = [{ title: currentGroup, items: [] }];
  for (let trick of allTricks) {
    let searchItem: SearchItem = {
      name: trick.alias ?? trick.technicalName,
      primaryKey: [trick.primaryKey[0], trick.primaryKey[1]],
      stickFrequency: trick.stickFrequency,
      isFavorite: trick.isFavourite,
      isNew: isStickableNew(trick.dateAddedEpoch),
    };
    if (getParameter(trick, 'difficulty') !== currentGroup) {
      currentGroup = getParameter(trick, 'difficulty');
      result.push({ title: currentGroup, items: [] });
    }
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

/*
const searchResult = ref<SearchResult>([
  {
    title: 'Level 1',
    items: [
      {
        name: 'Sofa Roll',
        primaryKey: [0, 'official'],
        stickFrequency: 2,
        isNew: false,
        isFavorite: false,
      },
      {
        name: 'Korean Roll',
        primaryKey: [1, 'official'],
        stickFrequency: 2,
        isNew: false,
        isFavorite: false,
      },
      {
        name: 'Chest Roll',
        primaryKey: [2, 'official'],
        stickFrequency: 6,
        isNew: false,
        isFavorite: true,
      },
    ],
  },
  {
    title: 'Level 2',
    items: [
      {
        name: 'Sofa Roll',
        primaryKey: [0, 'official'],
        stickFrequency: 2,
        isNew: false,
        isFavorite: false,
      },
    ],
  },
]);
*/
</script>

<template>
  <DefaultLayout>
    <div class="w-full h-24 border border-red-500 text-center text-red-500">Search Parameters</div>
    <div class="w-full flex flex-col gap-5">
      <div v-for="section in searchResult" class="w-full flex flex-col gap-1" :key="section.title">
        <div class="text-lg font-medium px-3 w-full text-center">{{ section.title }}</div>
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 w-full">
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
