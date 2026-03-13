<script setup lang="ts">
import { ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue/dist/iconify.js';
import type { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';

const props = defineProps<{
  variations: SearchItem[];
}>();

const isOpen = ref(false);

function variationLinkToDetails(primaryKey: SearchItem['primaryKey']): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <div class="relative">
    <slot />

    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <button
          class="absolute -bottom-[3px] left-0 z-20 h-8 w-full rounded-sm flex items-center justify-center"
          @click.prevent
        >
          <span class="rounded flex items-center justify-center gap-0.5 px-1 h-5" :class="{ 'bg-muted': isOpen }">
            <span class="text-[10px] text-muted-foreground leading-none">+{{ props.variations.length }}</span>
            <Icon icon="ic:round-keyboard-arrow-down" class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
          </span>
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
