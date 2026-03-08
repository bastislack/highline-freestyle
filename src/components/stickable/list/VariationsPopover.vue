<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue/dist/iconify.js';
import type { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';

const props = defineProps<{
  variations: SearchItem[];
}>();

function variationLinkToDetails(primaryKey: SearchItem['primaryKey']): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <div class="relative">
    <slot />

    <Popover>
      <PopoverTrigger as-child>
        <button
          class="absolute -bottom-[3px] left-1/2 -translate-x-1/2 z-20 h-8 w-8 rounded-sm flex items-center justify-center"
          @click.prevent
        >
          <Icon icon="ic:round-keyboard-arrow-down" class="h-5 w-5 rounded hover:bg-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        :side-offset="8"
        class="w-[min(90vw,28rem)] p-2"
      >
        <div class="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
          <StickableCard
            v-for="variation in props.variations"
            :key="`${variation.primaryKey[1]}:${variation.primaryKey[0]}`"
            :to="variationLinkToDetails(variation.primaryKey)"
            :stickFrequency="variation.stickFrequency"
            :isFavorite="variation.isFavorite"
            :isNew="variation.isNew"
            :status="variation.primaryKey[1]"
          >
            {{ variation.name }}
          </StickableCard>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
