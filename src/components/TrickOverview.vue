<script lang="ts" setup>
import { Trick } from '../util/trick';
import { tricks } from '../util/tricks';

const allTricks: Trick[] = tricks

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
  <div v-for="level in Object.keys(tricksByDifficulty).length - 1" :key="level">
    <h2 class="text-2xl font-bold py-2 text-center bg-light-gray">
      Level {{ level }}
    </h2>
    <hr class="drop-shadow border-dark-gray">
    <div class="p-4 flex xs:grid flex-col  xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
      <div v-for="trick in tricksByDifficulty[level as any]!" :key="trick.id"
        class="p-2 border rounded-md border-dark-gray bg-light-gray-250 flex items-center justify-center container h-20 drop-shadow">
        <p class="text-dark-gray text-center line-clamp-3 text-base/5 ">
          {{ trick.alias && trick.alias.length > 0 ? trick.alias : trick.technicalName }}
        </p>
      </div>
    </div>
    <hr class="border-dark-gray">
  </div>
  <h2 class="text-2xl font-bold py-2 text-center bg-light-gray">
    To Be Determined
  </h2>
  <hr class="drop-shadow border-dark-gray">
  <div class="p-4 grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
    <div v-for="trick in tricksByDifficulty['-1'] ?? []" :key="trick.id"
      class="p-2 border-2 rounded-md border-dark-gray bg-light-gray-250 flex items-center justify-center container h-20 drop-shadow">
      <p class="text-dark-gray text-center line-clamp-3 text-base/5 ">
        {{ trick.alias && trick.alias.length > 0 ? trick.alias : trick.technicalName }}
      </p>
    </div>
  </div>
</template>