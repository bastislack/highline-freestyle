<script setup lang="ts">
import { PrimaryKey, StickableStatus } from '@/lib/utils';
import { computed } from 'vue';
import { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';
import CardDecoration from './CardDecoration.vue';
import VariationsCollapsibleWrapper from './VariationsCollapsibleWrapper.vue';

const props = defineProps<{
  title: string;
  status: StickableStatus;
  linkToDetails: string;
  stickFrequency?: number;
  isFavorite: boolean;
  isNew: boolean;
  variations: SearchItem[];
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

function variationLinkToDetails(primaryKey: PrimaryKey): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <VariationsCollapsibleWrapper
    v-if="variations.length > 0"
    :item-id="`${props.status}:${props.linkToDetails}`"
  >
    <StickableCard :to="props.linkToDetails" :class="computedClass">
      <template #decoration>
        <CardDecoration :isFavorite="isFavorite" :isNew="isNew" :status="status"></CardDecoration>
      </template>
      {{ title }}
    </StickableCard>

    <template #variations>
      <StickableCard
        v-for="variation in variations"
        :key="`${variation.primaryKey[1]}:${variation.primaryKey[0]}`"
        :to="variationLinkToDetails(variation.primaryKey)"
        :class="computedClass"
      >
        <template #decoration>
          <CardDecoration
            :isFavorite="variation.isFavorite"
            :isNew="variation.isNew"
            :status="variation.primaryKey[1]"
          ></CardDecoration>
        </template>
        {{ variation.name }}
      </StickableCard>
    </template>
  </VariationsCollapsibleWrapper>

  <StickableCard v-else :to="props.linkToDetails" :class="computedClass">
    <template #decoration>
      <CardDecoration :isFavorite="isFavorite" :isNew="isNew" :status="status"></CardDecoration>
    </template>
    {{ title }}
  </StickableCard>
</template>
