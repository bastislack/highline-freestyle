<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import type { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';
import VariationsPopover from './VariationsPopover.vue';

const props = defineProps<{
  title: string;
  status: StickableStatus;
  linkToDetails: string;
  stickFrequency?: number;
  isFavorite: boolean;
  isNew: boolean;
  variations: SearchItem[];
  showVariations: boolean;
}>();
</script>

<template>
  <VariationsPopover
    v-if="variations.length > 0 && props.showVariations"
    :variations="variations"
    :stick-frequency="props.stickFrequency"
  >
    <StickableCard
      :to="props.linkToDetails"
      :stickFrequency="props.stickFrequency"
      :isFavorite="props.isFavorite"
      :isNew="props.isNew"
      :status="props.status"
    >
      {{ title }}
    </StickableCard>
  </VariationsPopover>

  <StickableCard
    v-else
    :to="props.linkToDetails"
    :stickFrequency="props.stickFrequency"
    :isFavorite="props.isFavorite"
    :isNew="props.isNew"
    :status="props.status"
  >
    {{ title }}
  </StickableCard>
</template>
