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
  stickFrequency: number;
  isFavorite: boolean;
  isNew: boolean;
}>();

const borderClass = computed<string>(() => {
  return [
    'border-border',
    'border-skill1',
    'border-skill2',
    'border-skill3',
    'border-skill4',
    'border-skill5',
    'border-skill6',
    'border-skill7',
  ][Math.max(0, Math.min(props.stickFrequency, 7))];
});
</script>

<template>
  <RouterLink
    :to="linkToDetails"
    class="p-1 rounded-sm border flex flex-col items-center text-center"
    :class="borderClass"
  >
    <div>{{ title }}</div>
    <div v-if="isNew || status === 'userDefined'" class="flex flex-row gap-1">
      <Badge v-if="status === 'userDefined'">
        <Icon icon="ic:round-person" />
        Custom
      </Badge>
      <Badge v-if="isNew">New</Badge>
    </div>
  </RouterLink>
</template>
