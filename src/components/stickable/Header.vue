<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';

function hasHistory(): boolean {
  return window.history.length > 2;
}
</script>

<template>
  <section class="w-full flex flex-col items-center px-3 py-2 bg-background drop-shadow">
    <div class="w-full max-w-4xl flex flex-row justify-between items-center">
      <slot name="buttonLeft" class="h-6 w-6">
        <Button
          size="icon"
          variant="ghost"
          @click="hasHistory() ? $router.back() : $router.push('/')"
        >
          <Icon icon="ic:round-arrow-back" class="h-6 w-6 text-primary" />
        </Button>
      </slot>

      <div class="px-5 truncate text-lg w-full">
        <slot></slot>
      </div>

      <slot name="buttonRight" class="h-6 w-6"></slot>
    </div>
  </section>
</template>
