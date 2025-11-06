<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { StickableStatus } from '@/lib/utils';
import CardDecoration from './CardDecoration.vue';

const props = defineProps<{
  to: string; // when present, render as RouterLink
  stickFrequency?: number;
  isFavorite: boolean;
  isNew: boolean;
  status: StickableStatus;
}>();

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

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(updateIsOverflowing);

  // Re-check when element size changes (e.g., when collapsible opens or window resizes)
  if (textElement.value) {
    resizeObserver = new ResizeObserver(updateIsOverflowing);
    resizeObserver.observe(textElement.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <RouterLink
    :to="to"
    class="p-2 rounded-sm border aspect-[7/5] flex text-center relative"
    :class="computedClass(props.stickFrequency)"
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
  </RouterLink>
</template>
