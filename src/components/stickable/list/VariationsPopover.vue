<script setup lang="ts">
import { ref, computed } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue/dist/iconify.js';
import type { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';

const props = defineProps<{
  variations: SearchItem[];
  stickFrequency?: number;
}>();

function highlightClass(stickFrequency?: number): string {
  const clamped = Math.max(0, Math.min(stickFrequency ?? 0, 7));
  return [
    'bg-muted',
    'bg-skill1-600',
    'bg-skill2-600',
    'bg-skill3-500',
    'bg-skill4-400',
    'bg-skill5-400',
    'bg-skill6-400',
    'bg-skill7-400',
  ][clamped];
}

const isOpen = ref(false);
const triggerRef = ref<HTMLElement>();

function getGridParent() {
  let el = triggerRef.value?.parentElement;
  while (el) {
    if (el.classList.contains('grid')) return el;
    el = el.parentElement;
  }
  return null;
}

const popoverWidth = computed(() => {
  const grid = getGridParent();
  if (!grid) return 'min(90vw, 34rem)';
  return `${grid.getBoundingClientRect().width}px`;
});

const virtualReference = {
  getBoundingClientRect() {
    const triggerRect = triggerRef.value?.getBoundingClientRect();
    const grid = getGridParent();
    const gridRect = grid?.getBoundingClientRect();
    const centerX = gridRect ? gridRect.left + gridRect.width / 2 : window.innerWidth / 2;
    const y = triggerRect?.bottom ?? 0;
    return {
      x: centerX,
      y,
      top: y,
      bottom: y,
      left: centerX,
      right: centerX,
      width: 0,
      height: 0,
    };
  },
};

function variationLinkToDetails(primaryKey: SearchItem['primaryKey']): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}
</script>

<template>
  <div class="relative">
    <div class="relative transition-transform duration-100" :class="isOpen ? 'z-[41] scale-[1.02]' : ''">
      <slot />
    </div>

    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <button ref="triggerRef"
          class="absolute -bottom-[3px] left-0 h-8 w-full rounded-sm flex items-center justify-center"
          :class="isOpen ? 'z-[41]' : 'z-20'" @click.prevent>
          <span class="rounded flex items-center justify-center gap-0.5 px-1 h-5"
            :class="isOpen ? highlightClass(props.stickFrequency) : ''">
            <span class="text-[10px] text-muted-foreground leading-none">+{{ props.variations.length }}</span>
            <Icon icon="ic:round-keyboard-arrow-down" class="h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': isOpen }" />
          </span>
        </button>
      </PopoverTrigger>
      <div v-if="isOpen" class="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" />
      <PopoverContent side="bottom" :side-offset="8" :reference="virtualReference" class="p-2"
        :style="{ width: popoverWidth }">
        <div class="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
          <StickableCard v-for="variation in props.variations"
            :key="`${variation.primaryKey[1]}:${variation.primaryKey[0]}`"
            :to="variationLinkToDetails(variation.primaryKey)" :stickFrequency="variation.stickFrequency"
            :isFavorite="variation.isFavorite" :isNew="variation.isNew" :status="variation.primaryKey[1]">
            {{ variation.name }}
          </StickableCard>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
