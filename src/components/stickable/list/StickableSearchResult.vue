<script setup lang="ts">
import { PrimaryKey, StickableStatus } from '@/lib/utils';
import type { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';
import VariationsPopover from './VariationsPopover.vue';
import StickFrequencyLongPressPopover from './StickFrequencyLongPressPopover.vue';

const props = defineProps<{
  title: string;
  primaryKey: PrimaryKey;
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
  <StickFrequencyLongPressPopover
    :trick-id="props.primaryKey[0]"
    :trick-status="props.primaryKey[1]"
  >
    <VariationsPopover
      v-if="variations.length > 0 && props.showVariations"
      :variations="variations"
      :primary-key="props.primaryKey"
      :stick-frequency="props.stickFrequency"
      :base-difficulty-level="props.difficultyLevel"
    >
      <StickableCard
        :to="props.linkToDetails"
        :primary-key="props.primaryKey"
        :stickFrequency="props.stickFrequency"
        :difficultyLevel="props.difficultyLevel"
        :showLevel="true"
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
      :primary-key="props.primaryKey"
      :stickFrequency="props.stickFrequency"
      :difficultyLevel="props.difficultyLevel"
      :showLevel="true"
      :isFavorite="props.isFavorite"
      :isNew="props.isNew"
      :status="props.status"
      :data-scroll-anchor="props.anchorKey"
    >
      {{ title }}
    </StickableCard>
  </StickFrequencyLongPressPopover>
</template>
