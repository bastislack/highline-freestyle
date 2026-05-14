<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { PrimaryKey, StickableStatus } from '@/lib/utils';
import messages_list from '@/i18n/list';
import CardDecoration from './CardDecoration.vue';
import { useEffectiveStickFrequency } from './stickFrequencyOverridesKey';
import { observeOverflowTarget, unobserveOverflowTarget } from './sharedResizeObserver';

const props = defineProps<{
  to: string; // when present, render as RouterLink
  primaryKey?: PrimaryKey;
  stickFrequency?: number;
  difficultyLevel?: number;
  baseDifficultyLevel?: number;
  showLevel?: boolean;
  isFavorite: boolean;
  isNew: boolean;
  status: StickableStatus;
}>();

const effectiveStickFrequency = useEffectiveStickFrequency(
  () => props.primaryKey,
  () => props.stickFrequency
);

const levelDelta = computed<'up' | 'down' | null>(() => {
  if (props.difficultyLevel == null || props.baseDifficultyLevel == null) return null;
  if (props.difficultyLevel > props.baseDifficultyLevel) return 'up';
  if (props.difficultyLevel < props.baseDifficultyLevel) return 'down';
  return null;
});

const { t } = useI18n({ messages: messages_list, useScope: 'local' });

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

const textElement = ref<HTMLElement>();
const isOverflowing = ref(false);

function borderClass(stickFrequency?: number): string {
  let stickFrequencyClamped = Math.max(0, Math.min(stickFrequency ?? 0, 7));
  return [
    'border-border',
    'border-skill1-600',
    'border-skill2-600',
    'border-skill3-500',
    'border-skill4-400',
    'border-skill5-400',
    'border-skill6-400',
    'border-skill7-400',
  ][stickFrequencyClamped];
}

function fillClass(stickFrequency?: number): string {
  let stickFrequencyClamped = Math.max(0, Math.min(stickFrequency ?? 0, 7));
  return [
    'bg-background',
    'bg-skill1',
    'bg-skill2',
    'bg-skill3',
    'bg-skill4',
    'bg-skill5',
    'bg-skill6',
    'bg-skill7',
  ][stickFrequencyClamped];
}

function computedClass(stickFrequency?: number): string {
  return `${fillClass(stickFrequency)} ${borderClass(stickFrequency)}`;
}

// This method is a hacky solution. If you find
// a cleaner way to handle this, feel free to do so!
// The goal is to use `text-lg` whenever possible,
// but when the text is overflowing 2 rows, then the
// font size should change to `text-sm` (also the
// line height is changed via `leading-4/5`).
const updateIsOverflowing = () => {
  if (!textElement.value) return;

  isOverflowing.value = false;

  nextTick(() => {
    if (!textElement.value) return;

    textElement.value.classList.remove('line-clamp-2');

    const style = window.getComputedStyle(textElement.value);
    const maxHeight = parseFloat(style.lineHeight) * 2;

    textElement.value.classList.add('line-clamp-2');

    // Check if content exceeds 2 lines (with small tolerance for rounding)
    isOverflowing.value = textElement.value.scrollHeight > maxHeight + 1;
  });
};

onMounted(() => {
  nextTick(updateIsOverflowing);

  // Re-check when element size changes (e.g., when collapsible opens or window resizes)
  if (textElement.value) {
    observeOverflowTarget(textElement.value, updateIsOverflowing);
  }
});

onBeforeUnmount(() => {
  if (textElement.value) unobserveOverflowTarget(textElement.value);
});
</script>

<template>
  <RouterLink
    :to="to"
    class="p-2 rounded-sm border aspect-[7/5] flex text-center relative"
    :class="computedClass(effectiveStickFrequency)"
  >
    <CardDecoration :isFavorite="props.isFavorite" :isNew="props.isNew" :status="props.status" />
    <div class="flex-grow flex flex-col tracking-tight justify-around w-full">
      <div
        ref="textElement"
        class="line-clamp-2"
        :class="{
          'text-sm leading-4': isOverflowing,
          'text-lg leading-5': !isOverflowing,
        }"
      >
        <slot />
      </div>
    </div>
    <div
      v-if="props.showLevel"
      class="absolute bottom-0 left-0 h-6 w-full flex items-center justify-center pointer-events-none"
    >
      <span
        class="rounded flex items-center justify-center gap-0.5 px-1 h-4 text-[9px] text-muted-foreground leading-none"
        :class="highlightClass(effectiveStickFrequency)"
      >
        <span>
          {{
            props.difficultyLevel != null
              ? t('cards.level', { level: props.difficultyLevel })
              : t('cards.levelUnknown')
          }}
        </span>
        <Icon v-if="levelDelta === 'up'" icon="ic:round-arrow-upward" class="h-3 w-3" />
        <Icon v-else-if="levelDelta === 'down'" icon="ic:round-arrow-downward" class="h-3 w-3" />
      </span>
    </div>
  </RouterLink>
</template>
