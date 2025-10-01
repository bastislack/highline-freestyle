<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import BadgeRow from './BadgeRow.vue';
import FavoriteMark from './FavoriteMark.vue';

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
    <BadgeRow :isNew="props.isNew" :status="props.status" />
  </slot>
</template>
