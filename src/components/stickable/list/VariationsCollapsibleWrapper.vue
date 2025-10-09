<script setup lang="ts">
import { ref, watch, nextTick, inject, computed } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Icon } from '@iconify/vue/dist/iconify.js';

const props = defineProps<{
  itemId: string;
}>();

const openCollapsibleId = inject<ReturnType<typeof ref<string | null>>>('openCollapsibleId');

const isOpen = computed({
  get: () => openCollapsibleId?.value === props.itemId,
  set: (value: boolean) => {
    if (openCollapsibleId) {
      openCollapsibleId.value = value ? props.itemId : null;
    }
  },
});

const contentHeight = ref(0);
const contentRef = ref<HTMLElement | null>(null);

async function updateHeight() {
  await nextTick();
  await nextTick(); // Extra tick to let CollapsibleContent render
  if (contentRef.value && isOpen.value) {
    contentHeight.value = contentRef.value.offsetHeight;
  } else {
    contentHeight.value = 0;
  }
}

watch(isOpen, () => {
  setTimeout(updateHeight, 50); // Small delay to let content render
});
</script>

<template>
  <!-- Use a wrapper div instead of making Collapsible use 'contents' -->
  <div class="contents">
    <Collapsible v-model:open="isOpen" class="contents">
      <div class="relative">
        <!-- Parent -->
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

      <!-- Spacer that creates space in the grid -->
      <div
        class="col-span-full transition-all duration-300 ease-in-out relative"
        :style="{ height: contentHeight + 'px' }"
      >
        <CollapsibleContent class="absolute left-1/2 -translate-x-1/2 w-screen top-0">
          <div
            ref="contentRef"
            class="mt-2 px-3 md:px-5 lg:px-6 xl:px-12 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
          >
            <slot name="variations"></slot>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  </div>
</template>
