<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps<{
  to: string; // when present, render as RouterLink
  class: string;
}>();

const textElement = ref<HTMLElement>();
const isOverflowing = ref(false);

const checkOverflow = () => {
  if (!textElement.value) return;

  isOverflowing.value = false;

  nextTick(() => {
    if (!textElement.value) return;

    textElement.value.classList.remove('line-clamp-2');
    void textElement.value.offsetHeight;

    const style = window.getComputedStyle(textElement.value);
    const maxHeight = parseFloat(style.lineHeight) * 2;

    textElement.value.classList.add('line-clamp-2');

    // Check if content exceeds 2 lines (with small tolerance for rounding)
    isOverflowing.value = textElement.value.scrollHeight > maxHeight + 1;
  });
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(checkOverflow);

  // Re-check when element size changes (e.g., when collapsible opens or window resizes)
  if (textElement.value) {
    resizeObserver = new ResizeObserver(checkOverflow);
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
    class="p-2 rounded-sm border aspect-[8/5] flex text-center relative"
    :class="props.class"
  >
    <slot name="decoration" />
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
