<script setup lang="ts">
import { RouterLink } from 'vue-router';

const props = defineProps<{
  to: string; // when present, render as RouterLink
  class: string;
}>();
</script>

<template>
  <RouterLink
    :to="to"
    class="p-1 rounded-sm border flex flex-col items-center justify-center text-center relative overflow-clip"
    :class="props.class"
  >
    <slot name="decoration" />
    <div class="flex-grow flex flex-col justify-around w-full">
      <slot />
    </div>
  </RouterLink>
</template>
