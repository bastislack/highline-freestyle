<script setup lang="ts">
import type { Ref } from 'vue';
import { ref, watch, nextTick, inject, computed, onMounted, onBeforeUnmount } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { OpenCollapsibleIdKey, PendingOpenCollapsibleIdKey } from '@/keys/OpenCollapsibleId';

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
  if (open) {
    isAnimating.value = true;
    await nextTick();
    requestAnimationFrame(() => {
      scheduleMeasure();
      contentOpacity.value = 1;
    });
  } else {
    isAnimating.value = true;
    await nextTick();
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
  <!-- Use a wrapper div instead of making Collapsible use 'contents' -->
  <div class="contents">
    <Collapsible v-model:open="isOpen" class="contents">
      <div class="relative">
        <!-- Parent -->
        <slot></slot>

        <CollapsibleTrigger as-child class="absolute top-1 left-1 z-20">
          <button
            class="h-6 w-6 rounded-sm flex items-center justify-center transition-transform"
            :class="{ 'rotate-180': isOpen, animationDuration }"
          >
            <Icon icon="ic:round-keyboard-arrow-down" class="h-5 w-5" />
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
            class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 transition-opacity ease-in-out"
            :class="animationDuration"
            :style="{ opacity: contentOpacity }"
          >
            <slot name="variations"></slot>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  </div>
</template>
