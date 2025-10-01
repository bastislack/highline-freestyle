<script setup lang="ts">
import { ref } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Icon } from '@iconify/vue/dist/iconify.js';

const isOpen = ref(false);
</script>

<template>
  <Collapsible v-model:open="isOpen" class="col-span-full">
    <div class="grid grid-cols-subgrid">
      <div class="relative">
        <!-- // Parent -->
        <slot></slot>

        <CollapsibleTrigger as-child class="absolute top-1 left-1 z-20">
          <button
            @click.prevent
            class="h-6 w-6 rounded-sm flex items-center justify-center transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          >
            <Icon icon="ic:round-keyboard-arrow-down" class="h-5 w-5" />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent class="col-span-full">
        <div class="mt-2 mb-1 grid grid-cols-subgrid col-span-full gap-2">
          <!-- // List of variation cards -->
          <slot name="variations"></slot>
        </div>
      </CollapsibleContent>
    </div>
  </Collapsible>
</template>
