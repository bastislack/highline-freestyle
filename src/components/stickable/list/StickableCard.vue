<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted, nextTick, watch } from 'vue';

const props = defineProps<{
  to: string; // when present, render as RouterLink
  class: string;
}>();

const textElement = ref<HTMLElement>();
const isOverflowing = ref(false);

const checkOverflow = () => {
  if (!textElement.value) return;

  // Temporarily set to larger size to measure
  textElement.value.classList.remove('text-sm');
  textElement.value.classList.add('text-lg');

  // Check if content exceeds 2 lines
  isOverflowing.value = textElement.value.scrollHeight > textElement.value.clientHeight;
};

onMounted(() => {
  nextTick(checkOverflow);
});

// Watch for any changes that might affect the content
watch(
  () => textElement.value,
  () => {
    nextTick(checkOverflow);
  },
  { flush: 'post' }
);
</script>

<template>
  <RouterLink
    :to="to"
    class="p-2 rounded-sm border aspect-[8/5] flex text-center relative"
    :class="props.class"
  >
    <slot name="decoration" />
    <div class="flex-grow flex flex-col tracking-tight justify-around w-full">
      <div ref="textElement" class="line-clamp-2" :class="isOverflowing ? 'text-sm' : 'text-lg'">
        <slot />
      </div>
    </div>
  </RouterLink>
</template>
