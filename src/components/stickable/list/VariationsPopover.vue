<script setup lang="ts">
import { ref, computed } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@iconify/vue/dist/iconify.js';
import type { PrimaryKey } from '@/lib/utils';
import type { SearchItem } from '@/types/search';
import StickableCard from './StickableCard.vue';
import StickFrequencyLongPressPopover from './StickFrequencyLongPressPopover.vue';
import { useEffectiveStickFrequency } from './stickFrequencyOverridesKey';
import { provideNestedPopoverFlag, usePopoverAutoClose } from '@/composables/usePopoverAutoClose';

const props = defineProps<{
  variations: SearchItem[];
  primaryKey?: PrimaryKey;
  stickFrequency?: number;
  baseDifficultyLevel?: number;
}>();

const effectiveStickFrequency = useEffectiveStickFrequency(
  () => props.primaryKey,
  () => props.stickFrequency
);

function highlightClass(stickFrequency?: number): string {
  const clamped = Math.max(0, Math.min(stickFrequency ?? 0, 7));
  return [
    'bg-muted',
    'bg-skill1-600/50',
    'bg-skill2-600/50',
    'bg-skill3-500/50',
    'bg-skill4-400/50',
    'bg-skill5-400/50',
    'bg-skill6-400/50',
    'bg-skill7-400/50',
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

const { isRouteLeaving } = usePopoverAutoClose(triggerRef, isOpen);
const nestedPopoverOpen = provideNestedPopoverFlag();

function variationLinkToDetails(primaryKey: SearchItem['primaryKey']): string {
  return `/tricks/${primaryKey[1]}/${primaryKey[0]}`;
}

// While the popover is open, a click on the underlying card acts like a click
// on the backdrop: dismiss, don't navigate. Clicks on the trigger button itself
// still pass through so Reka can toggle the popover.
function onCardClickCapture(e: MouseEvent) {
  if (!isOpen.value) return;
  if (triggerRef.value && triggerRef.value.contains(e.target as Node)) return;
  e.preventDefault();
  e.stopPropagation();
  isOpen.value = false;
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <div class="relative">
      <div
        class="relative transition-transform duration-100"
        :class="isOpen ? 'z-[21] scale-[1.02]' : ''"
        @click.capture="onCardClickCapture"
      >
        <slot />
        <PopoverTrigger as-child>
          <button
            ref="triggerRef"
            class="absolute -bottom-[3px] left-0 h-8 w-full rounded-sm flex items-center justify-center"
            :class="isOpen ? 'z-[21]' : 'z-10'"
            @click.prevent
          >
            <span
              class="rounded flex items-center justify-center gap-0.5 px-1 h-5"
              :class="highlightClass(effectiveStickFrequency)"
            >
              <span class="text-[10px] text-muted-foreground leading-none">
                +{{ props.variations.length }}
              </span>
              <Icon
                icon="ic:round-keyboard-arrow-down"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': isOpen }"
              />
            </span>
          </button>
        </PopoverTrigger>
      </div>

      <Teleport to="body">
        <div
          v-if="isOpen && !nestedPopoverOpen"
          class="fixed -inset-[100px] z-20 bg-black/10 backdrop-blur-[1px]"
        />
      </Teleport>

      <PopoverContent
        v-if="!isRouteLeaving"
        side="bottom"
        :side-offset="8"
        :reference="virtualReference"
        position-strategy="absolute"
        class="!z-[25] p-2 max-h-[50vh] overflow-y-auto"
        :style="{ width: popoverWidth }"
      >
        <div class="grid grid-cols-3 gap-2">
          <StickFrequencyLongPressPopover
            v-for="variation in props.variations"
            :key="`${variation.primaryKey[1]}:${variation.primaryKey[0]}`"
            :trick-id="variation.primaryKey[0]"
            :trick-status="variation.primaryKey[1]"
          >
            <StickableCard
              :to="variationLinkToDetails(variation.primaryKey)"
              :primary-key="variation.primaryKey"
              :stickFrequency="variation.stickFrequency"
              :difficultyLevel="variation.difficultyLevel"
              :baseDifficultyLevel="props.baseDifficultyLevel"
              :showLevel="true"
              :isFavorite="variation.isFavorite"
              :isNew="variation.isNew"
              :status="variation.primaryKey[1]"
            >
              {{ variation.name }}
            </StickableCard>
          </StickFrequencyLongPressPopover>
        </div>
      </PopoverContent>
    </div>
  </Popover>
</template>
