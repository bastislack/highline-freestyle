<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import Badge from '@/components/ui/badge/Badge.vue';
import { Icon } from '@iconify/vue/dist/iconify.js';

const props = defineProps<{
  title: string;
  status: StickableStatus;
  linkToDetails: string;
  stickFrequency?: number;
  isFavorite: boolean;
  isNew: boolean;
}>();

const borderClass = computed<string>(() => {
  let stickFrequency = Math.max(0, Math.min(props.stickFrequency ?? 0, 7));
  return [
    'border-border',
    'border-skill1-600',
    'border-skill2-600',
    'border-skill3-500',
    'border-skill4-400',
    'border-skill5-400',
    'border-skill6-400',
    'border-skill7-400',
  ][stickFrequency];
});

const fillClass = computed<string>(() => {
  let stickFrequency = Math.max(0, Math.min(props.stickFrequency ?? 0, 7));
  return [
    'bg-background',
    'bg-skill1',
    'bg-skill2',
    'bg-skill3',
    'bg-skill4',
    'bg-skill5',
    'bg-skill6',
    'bg-skill7',
  ][stickFrequency];
});

const computedClass = computed<string>(() => {
  return `${fillClass.value} ${borderClass.value}`;
});
</script>

<template>
  <RouterLink
    :to="linkToDetails"
    class="p-1 rounded-sm border flex flex-col items-center justify-center text-center relative overflow-clip"
    :class="computedClass"
  >
    <div v-if="isFavorite">
      <Icon icon="ic:round-star" class="absolute top-1 right-1 h-5 w-5 z-10" />
      <div class="absolute top-0 right-0 w-7 h-7 z-0 blur-md rounded-full" :class="fillClass"></div>
      <div class="absolute top-0 right-0 w-7 h-7 z-0 blur-md rounded-full" :class="fillClass"></div>
      <div class="absolute top-0 right-0 w-6 h-6 z-0 blur-sm rounded-full" :class="fillClass"></div>
      <div class="absolute top-0 right-0 w-6 h-6 z-0 blur-sm rounded-full" :class="fillClass"></div>
    </div>

    <div class="flex-grow flex flex-col justify-around w-full">{{ title }}</div>

    <div
      v-if="isNew || status === 'userDefined'"
      class="my-1 flex flex-row justify-center gap-1 flex-wrap"
    >
      <Badge v-if="status === 'userDefined'" class="px-2" variant="secondary">
        <Icon icon="ic:round-person" class="mr-1" />
        Custom
      </Badge>
      <Badge v-else-if="status === 'archived'" class="px-2" variant="destructive">
        <Icon icon="ic:baseline-archive" class="mr-1" />
        Archived
      </Badge>

      <Badge
        v-if="isNew"
        class="px-2 bg-secondary-950 text-secondary-50 hover:bg-secondary-950"
        variant="secondary"
      >
        <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
        New
      </Badge>
    </div>
  </RouterLink>
</template>
