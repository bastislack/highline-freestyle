<script lang="ts" setup>
// !Warning! This Component has an async Setup. As such it MUST be encapsulated in a Suspense-Wrapper!

import type { Trick } from '@/lib/database/daos/trick';
import DifficultyGroup from './DifficultyGroup.vue';

const allTricks = await (await import('@/lib/database')).tricksDao.getAll()
console.log({ allTricks})
const tricksByDifficulty: Record<string, Trick[]> = {}


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

console.log({ tricksByDifficulty })

</script>


<template>
  <section v-for="level in Object.keys(tricksByDifficulty).filter( e => Number(e) >= 0)" :key="level">
    <DifficultyGroup :level="level" :tricks="tricksByDifficulty[level]"  />
  </section>
  <section v-if="(tricksByDifficulty['-1'] ?? []).length > 0">
    <DifficultyGroup level="To be determined" :tricks="tricksByDifficulty['-1']" />
  </section>
</template>