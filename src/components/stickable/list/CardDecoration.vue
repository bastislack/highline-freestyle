<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import FavoriteMark from './FavoriteMark.vue';
import StatusIcon from './StatusIcon.vue';

const props = defineProps<{
  isFavorite: boolean;
  isNew: boolean;
  status: StickableStatus;
}>();
</script>

<template>
  <slot
    name="decoration"
    :isFavorite="props.isFavorite"
    :isNew="props.isNew"
    :status="props.status"
  >
    <FavoriteMark :show="props.isFavorite" />
    <StatusIcon :isNew="props.isNew" :status="props.status" />
  </slot>
</template>
