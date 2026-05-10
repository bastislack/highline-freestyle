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
  difficultyLevel?: number;
  isFavorite: boolean;
  isNew: boolean;
  variations: SearchItem[];
  showVariations: boolean;
  // Stable per-item key so useScrollAnchor can find this card on return.
  // Lands on the rendered <a>, which is what the user sees in both branches —
  // the popover branch's wrapper divs sit invisibly around the same <a>.
  anchorKey?: string;
}>();
</script>

<template>
  <VariationsPopover
    v-if="variations.length > 0 && props.showVariations"
    :variations="variations"
    :stick-frequency="props.stickFrequency"
    :base-difficulty-level="props.difficultyLevel"
  >
    <StickableCard
      :to="props.linkToDetails"
      :stickFrequency="props.stickFrequency"
      :isFavorite="props.isFavorite"
      :isNew="props.isNew"
      :status="props.status"
      :data-scroll-anchor="props.anchorKey"
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
    :data-scroll-anchor="props.anchorKey"
  >
    {{ title }}
  </StickableCard>
</template>
