<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import databaseInstance from '../lib/database/databaseInstance';
import { Trick } from '../lib/database/daos/tricks';
// @ts-expect-error no .d.ts defined yet
import {tricks as x} from "virtual:highline-freestyle-data"
console.log(x)

const tricks = ref<Trick[]>([])

async function fetchTricksData() {
  return databaseInstance.tricksDao.getAll()
}

onMounted( async() => {
  // Setup code
  tricks.value = await fetchTricksData()
  console.log(tricks.value)
})

onUnmounted( () => {
  // (Potential) Cleanup Code
})



</script>


<template>
  <DefaultLayout :flex-spacer="true">
    <div class="text-white p-4">
      <ul class="w-100 overflow-x-scroll">
        <pre v-for="entry of x" class="">{{ JSON.stringify(entry)}}</pre>
      </ul>
    </div>
  </DefaultLayout>

</template>
