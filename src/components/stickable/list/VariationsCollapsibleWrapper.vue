<script setup lang="ts">
import type { Ref } from 'vue';
import { ref, watch, nextTick, inject, computed, onMounted, onBeforeUnmount } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { OpenCollapsibleIdKey } from '@/keys/OpenCollapsibleId';

const props = defineProps<{
  itemId: string;
}>();

const fallback = ref<string | null>(null);
const openCollapsibleId = inject<Ref<string | null>>(OpenCollapsibleIdKey, fallback);

const isOpen = computed({
  get: () => openCollapsibleId.value === props.itemId,
  set: (value: boolean) => {
    openCollapsibleId.value = value ? props.itemId : null;
  },
});

const spacerHeight = ref(0);
const contentRef = ref<HTMLElement | null>(null);

let ro: ResizeObserver | null = null;
let scheduled = false;

function measureNow() {
  if (!contentRef.value) return;
  spacerHeight.value = Math.ceil(contentRef.value.scrollHeight);
}

function scheduleMeasure() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    measureNow();
  });
}

watch(isOpen, async (open) => {
  await nextTick();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (open) scheduleMeasure();
      else spacerHeight.value = 0;
    })
  );
});

onMounted(() => {
  ro = new ResizeObserver(() => {
    if (!isOpen.value) return;
    scheduleMeasure();
  });
  if (contentRef.value) ro.observe(contentRef.value);
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
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
            class="h-6 w-6 rounded-sm flex items-center justify-center transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          >
            <Icon icon="ic:round-keyboard-arrow-down" class="h-5 w-5" />
          </button>
        </CollapsibleTrigger>
      </div>

      <!-- Spacer that creates space in the grid -->
      <div
        class="col-span-full transition-all duration-200 ease-in-out relative overflow-hidden"
        :style="{ height: spacerHeight + 'px' }"
      >
        <CollapsibleContent
          class="absolute left-1/2 -translate-x-1/2 w-full top-0 transition-all duration-200 data-[state=closed]:opacity-0 data-[state=closed]:-translate-y-1.5 data-[state=open]:opacity-100 data-[state=open]:translate-y-0"
        >
          <div
            ref="contentRef"
            class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
          >
            <slot name="variations"></slot>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  </div>
</template>
