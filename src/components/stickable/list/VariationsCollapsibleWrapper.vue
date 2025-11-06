<script setup lang="ts">
import type { Ref } from 'vue';
import { ref, watch, nextTick, inject, computed, onMounted, onBeforeUnmount } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Icon } from '@iconify/vue/dist/iconify.js';
import {
  OpenCollapsibleIdKey,
  PendingOpenCollapsibleIdKey,
} from '@/components/stickable/list/OpenCollapsibleId';

const props = defineProps<{
  itemId: string;
}>();

const fallback = ref<string | null>(null);
const openCollapsibleId = inject<Ref<string | null>>(OpenCollapsibleIdKey, fallback);
const pendingOpenId = inject<Ref<string | null>>(PendingOpenCollapsibleIdKey, fallback);

const isOpen = computed({
  get: () => openCollapsibleId.value === props.itemId,
  set: (value: boolean) => {
    if (value) {
      if (openCollapsibleId.value && openCollapsibleId.value !== props.itemId) {
        pendingOpenId.value = props.itemId;
        openCollapsibleId.value = null;
      } else {
        openCollapsibleId.value = props.itemId;
      }
    } else {
      openCollapsibleId.value = null;
      pendingOpenId.value = null;
    }
  },
});

const spacerHeight = ref(0);
const contentRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false);
const contentOpacity = ref(0);

const animationDuration = computed(() => (isOpen.value ? 'duration-200' : 'duration-150'));

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

function onTransitionEnd() {
  if (!isOpen.value) {
    isAnimating.value = false;
    if (pendingOpenId.value) {
      const idToOpen = pendingOpenId.value;
      pendingOpenId.value = null;
      openCollapsibleId.value = idToOpen;
    }
  }
}

watch(isOpen, async (open) => {
  isAnimating.value = true;
  await nextTick();
  if (open) {
    requestAnimationFrame(() => {
      scheduleMeasure();
      contentOpacity.value = 1;
    });
  } else {
    spacerHeight.value = 0;
    contentOpacity.value = 0;
  }
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
  <Collapsible v-model:open="isOpen" class="contents">
    <div class="relative">
      <slot></slot>

      <CollapsibleTrigger as-child class="absolute -bottom-[3px] left-1/2 -translate-x-1/2 z-20">
        <button
          class="h-8 w-8 rounded-sm flex items-center justify-center transition-transform"
          :class="{ 'rotate-180': isOpen, animationDuration }"
        >
          <Icon icon="ic:round-keyboard-arrow-down" class="h-5 w-5 rounded hover:bg-muted" />
        </button>
      </CollapsibleTrigger>
    </div>

    <!-- Spacer that creates space in the grid -->
    <div
      v-show="isOpen || isAnimating"
      class="col-span-full transition-all border rounded-sm bg-stone-100 ease-in-out relative overflow-hidden"
      :class="animationDuration"
      :style="{ height: spacerHeight + 'px' }"
      @transitionend="onTransitionEnd"
      ref="contentRef"
    >
      <CollapsibleContent class="absolute left-1/2 -translate-x-1/2 w-full p-2">
        <div
          class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 transition-opacity ease-in-out"
          :class="animationDuration"
          :style="{ opacity: contentOpacity }"
        >
          <slot name="variations"></slot>
        </div>
      </CollapsibleContent>
    </div>
  </Collapsible>
</template>
