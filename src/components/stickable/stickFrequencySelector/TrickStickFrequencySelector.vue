<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { tricksDao } from '@/lib/database';
import StickFrequencySelector from './StickFrequencySelector.vue';
import { Trick } from '@/lib/database/daos/trick';

const props = defineProps<{
  trickId: number;
  trickStatus: 'official' | 'archived' | 'userDefined';
}>();

const trick = ref<Trick>();
const frequencyModel = ref<[number]>([0]);

watchEffect(async () => {
  trick.value = await tricksDao.getById(props.trickId, props.trickStatus);
  if (trick.value === undefined) {
    throw new Error(`Unknown trick with key [${props.trickId}, ${props.trickStatus}]`);
  }
  frequencyModel.value = [trick.value.stickFrequency ?? 0];
});

async function updateStickFrequency(frequencyArr: [number]) {
  if (trick.value === undefined) {
    throw new Error('Trick is undefined!');
  }
  const frequency = Math.max(0, Math.min(frequencyArr[0], 7));
  frequencyModel.value = [frequency];
  trick.value.stickFrequency = frequency;
  await trick.value.persist();
}
</script>

<template>
  <StickFrequencySelector
    :frequency="frequencyModel"
    @update:frequency="updateStickFrequency"
    class="w-full"
  />
</template>
