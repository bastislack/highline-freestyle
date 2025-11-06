<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import { Icon } from '@iconify/vue/dist/iconify.js';
import StatusIcon from './StatusIcon.vue';

const props = defineProps<{
  isFavorite: boolean;
  isNew: boolean;
  status: StickableStatus;
}>();
</script>

<template>
  <div v-if="props.isFavorite" class="absolute top-1 left-1">
    <Icon icon="ic:round-star" class="h-5 w-5" />
  </div>
  <StatusIcon :isNew="props.isNew" :status="props.status" />
</template>
