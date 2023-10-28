<script lang="ts" setup>
import { onMounted } from 'vue';
import { Trick } from '../util/trick';
import { tricks } from '../util/tricks';

const allTricks: Trick[] = tricks

const tricksByDifficulty: Map<number, Trick[]> = new Map()

onMounted(() => {
  allTricks.forEach(trick => {
    if (tricksByDifficulty.has(trick.difficultyLevel)) {
      tricksByDifficulty.get(trick.difficultyLevel)?.push(trick)
    } else {
      tricksByDifficulty.set(trick.difficultyLevel, [trick])
    }
  })

  tricksByDifficulty.forEach((tricks) => {
    tricks.sort(compareTrickNames)
  })
})

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
  <div v-for="level in tricksByDifficulty.size - 1" :key="level">
    <h2 class="text-2xl font-bold py-2 text-center bg-light-gray">
      Level {{ level }}</h2>
    <hr class="drop-shadow border-dark-gray">
    <div class="p-4 grid grid-cols-3 gap-3">
      <div v-for="trick in tricksByDifficulty.get(level)!" :key="trick.id"
        class="p-2 border-2 rounded-md border-dark-gray bg-light-gray-250 flex items-center justify-center container h-20 drop-shadow">
        <p class="text-dark-gray text-center line-clamp-3 text-base/5 ">
          {{ trick.alias && trick.alias.length > 0 ? trick.alias : trick.technicalName }}
        </p>
      </div>
    </div>
    <hr class="border-dark-gray">
  </div>
</template>