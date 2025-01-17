<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import Badge from '../ui/badge/Badge.vue';
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
    'border-skill1',
    'border-skill2',
    'border-skill3',
    'border-skill4',
    'border-skill5',
    'border-skill6',
    'border-skill7',
  ][stickFrequency];
});
</script>

<template>
  <RouterLink
    :to="linkToDetails"
    class="p-1 rounded-sm border flex flex-col items-center justify-center text-center"
    :class="borderClass"
  >
    <div>{{ title }}</div>
    <div
      v-if="isNew || status === 'userDefined'"
      class="mt-1 flex flex-row justify-center gap-1 flex-wrap"
    >
      <Badge v-if="status === 'userDefined'" class="py-0 px-2" variant="secondary">
        <Icon icon="ic:round-person" class="mr-1" />
        Custom
      </Badge>
      <Badge v-else-if="status === 'archived'" class="py-0 px-2" variant="destructive">
        <Icon icon="ic:baseline-archive" class="mr-1" />
        Archived
      </Badge>

      <Badge v-if="isNew" class="py-0 px-2" variant="secondary">
        <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
        New
      </Badge>
    </div>
  </RouterLink>
</template>
