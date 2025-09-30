<script setup lang="ts">
import { StickableStatus } from '@/lib/utils';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Badge from '@/components/ui/badge/Badge.vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/list';
import { SearchItem } from '@/types/search';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

const props = defineProps<{
  title: string;
  status: StickableStatus;
  linkToDetails: string;
  stickFrequency?: number;
  isFavorite: boolean;
  isNew: boolean;
  variations: SearchItem[];
}>();

const isOpen = ref(false);

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

function variationLinkToDetails(primaryKey: [number, StickableStatus]): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <Collapsible v-if="variations.length > 0" v-model:open="isOpen" class="col-span-full">
    <div class="grid grid-cols-subgrid col-span-full">
      <div class="relative">
        <RouterLink
          :to="props.linkToDetails"
          class="p-1 rounded-sm border flex flex-col items-center justify-center text-center relative overflow-clip h-full"
          :class="computedClass"
        >
          <div v-if="isFavorite">
            <Icon icon="ic:round-star" class="absolute top-1 right-1 h-5 w-5 z-10" />
            <div
              class="absolute top-0 right-0 w-7 h-7 z-0 blur-md rounded-full"
              :class="fillClass"
            ></div>
            <div
              class="absolute top-0 right-0 w-7 h-7 z-0 blur-md rounded-full"
              :class="fillClass"
            ></div>
            <div
              class="absolute top-0 right-0 w-6 h-6 z-0 blur-sm rounded-full"
              :class="fillClass"
            ></div>
            <div
              class="absolute top-0 right-0 w-6 h-6 z-0 blur-sm rounded-full"
              :class="fillClass"
            ></div>
          </div>

          <div class="flex-grow flex flex-col justify-around w-full">{{ title }}</div>

          <div
            v-if="isNew || status === 'userDefined'"
            class="my-1 flex flex-row justify-center gap-1 flex-wrap"
          >
            <Badge v-if="status === 'userDefined'" class="px-2" variant="secondary">
              <Icon icon="ic:round-person" class="mr-1" />
              {{ t('cards.badges.personal') }}
            </Badge>
            <Badge v-else-if="status === 'archived'" class="px-2" variant="destructive">
              <Icon icon="ic:baseline-archive" class="mr-1" />
              {{ t('cards.badges.archived') }}
            </Badge>

            <Badge
              v-if="isNew"
              class="px-2 bg-secondary-950 text-secondary-50 hover:bg-secondary-950"
              variant="secondary"
            >
              <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
              {{ t('cards.badges.new') }}
            </Badge>
          </div>
        </RouterLink>

        <CollapsibleTrigger as-child class="absolute top-1 left-1 z-20">
          <button
            @click.prevent
            class="h-6 w-6 rounded-sm bg-background/80 hover:bg-background border border-border flex items-center justify-center transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          >
            <Icon icon="ic:round-keyboard-arrow-down" class="h-5 w-5" />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent class="col-span-full">
        <div class="mt-2 mb-1 grid grid-cols-subgrid col-span-full gap-2">
          <RouterLink
            v-for="variation in variations"
            :key="`${variation.primaryKey[1]}:${variation.primaryKey[0]}`"
            :to="variationLinkToDetails(variation.primaryKey)"
            class="p-1 rounded-sm border flex flex-col items-center justify-center text-center relative overflow-clip opacity-80 hover:opacity-100 text-sm"
            :class="computedClass"
          >
            <div class="flex-grow flex flex-col justify-around w-full">{{ variation.name }}</div>
          </RouterLink>
        </div>
      </CollapsibleContent>
    </div>
  </Collapsible>

  <RouterLink
    v-else
    :to="props.linkToDetails"
    class="p-1 rounded-sm border flex flex-col items-center justify-center text-center relative overflow-clip"
    :class="computedClass"
  >
    <div v-if="isFavorite">
      <Icon icon="ic:round-star" class="absolute top-1 right-1 h-5 w-5 z-10" />
      <div class="absolute top-0 right-0 w-7 h-7 z-0 blur-md rounded-full" :class="fillClass"></div>
      <div class="absolute top-0 right-0 w-7 h-7 z-0 blur-md rounded-full" :class="fillClass"></div>
      <div class="absolute top-0 right-0 w-6 h-6 z-0 blur-sm rounded-full" :class="fillClass"></div>
      <div class="absolute top-0 right-0 w-6 h-6 z-0 blur-sm rounded-full" :class="fillClass"></div>
    </div>

    <div class="flex-grow flex flex-col justify-around w-full">{{ title }}</div>

    <div
      v-if="isNew || status === 'userDefined'"
      class="my-1 flex flex-row justify-center gap-1 flex-wrap"
    >
      <Badge v-if="status === 'userDefined'" class="px-2" variant="secondary">
        <Icon icon="ic:round-person" class="mr-1" />
        {{ t('cards.badges.personal') }}
      </Badge>
      <Badge v-else-if="status === 'archived'" class="px-2" variant="destructive">
        <Icon icon="ic:baseline-archive" class="mr-1" />
        {{ t('cards.badges.archived') }}
      </Badge>

      <Badge
        v-if="isNew"
        class="px-2 bg-secondary-950 text-secondary-50 hover:bg-secondary-950"
        variant="secondary"
      >
        <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
        {{ t('cards.badges.new') }}
      </Badge>
    </div>
  </RouterLink>
</template>
