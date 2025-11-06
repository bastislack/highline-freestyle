<script setup lang="ts">
import { PrimaryKey, StickableStatus } from '@/lib/utils';
import { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';
import VariationsCollapsibleWrapper from './VariationsCollapsibleWrapper.vue';

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

function variationLinkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <VariationsCollapsibleWrapper
    v-if="variations.length > 0 && props.showVariations"
    :item-id="`${props.status}:${props.linkToDetails}`"
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

    <template #variations>
      <StickableCard
        v-for="variation in variations"
        :key="`${variation.primaryKey[1]}:${variation.primaryKey[0]}`"
        :to="variationLinkToDetails(variation.primaryKey)"
        :stickFrequency="variation.stickFrequency"
        :isFavorite="variation.isFavorite"
        :isNew="variation.isNew"
        :status="variation.primaryKey[1]"
      >
        {{ variation.name }}
      </StickableCard>
    </template>
  </VariationsCollapsibleWrapper>

  <StickableCard
    v-else
    :to="props.linkToDetails"
    :stickFrequency="props.stickFrequency"
    :isFavorite="isFavorite"
    :isNew="props.isNew"
    :status="props.status"
  >
    {{ title }}
  </StickableCard>
</template>
