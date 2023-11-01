<script lang="ts" setup>
// !Warning! This Component has an async Setup. As such it MUST be encapsulated in a Suspense-Wrapper!

import type { Trick } from '../lib/database/daos/trick';
import TrickOverviewCard from './TrickOverviewCard.vue';


const allTricks = await (await import('../lib/database')).tricksDao.getAll()

const tricksByDifficulty: Record<number, Trick[]> = {}


allTricks.forEach(trick => {
  const difficultyLevel = trick.difficultyLevel;
  if (!tricksByDifficulty[difficultyLevel]) {
    tricksByDifficulty[difficultyLevel] = []
  }

  tricksByDifficulty[difficultyLevel].push(trick)
})

Object.keys(tricksByDifficulty).forEach(
  e => tricksByDifficulty[e as any] = tricksByDifficulty[e as any].sort(compareTrickNames)
);

console.log(tricksByDifficulty)


function compareTrickNames(a: Trick, b: Trick) {
  if (a.alias && b.alias) {
    return a.alias.localeCompare(b.alias)
  } else if (a.alias) {
    return a.alias.localeCompare(b.technicalName)
  } else if (b.alias) {
    return a.technicalName.localeCompare(b.alias)
  } else {
    return a.technicalName.localeCompare(b.technicalName)
  }
}

</script>


<template>
  <div v-for="level in Object.keys(tricksByDifficulty).filter( e => Number(e) >= 0).reverse()" :key="level">
    <h2 class="text-2xl font-bold py-2 text-center bg-light-gray border-b border-t border-black">
      Level {{ level }}
    </h2>
    <div class="p-4 flex xs:grid flex-col xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
      <TrickOverviewCard v-for="trick in tricksByDifficulty[level as any]!" :trick="trick" :key="trick.primaryKey.join('-')" />
    </div>
  </div>
  <div v-if="(tricksByDifficulty['-1'] ?? []).length > 0">
    <h2 class="text-2xl font-bold py-2 text-center bg-light-gray border-b border-t border-black">
      To Be Determined
    </h2>
 
    <div class="p-4 flex xs:grid flex-col xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
      <TrickOverviewCard v-for="trick in tricksByDifficulty['-1' as any]!" :trick="trick" :key="trick.primaryKey.join('-')" />
    </div>
  </div>
</template>