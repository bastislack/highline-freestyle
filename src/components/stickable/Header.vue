<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { useHistoryNav } from '@/composables/useHistoryNav';
import { useAutoHideOnScroll } from '@/composables/useAutoHideOnScroll';
import { useSymmetricSlots } from '@/composables/useSymmetricSlots';
import { useMediaQuery } from '@/composables/useMediaQuery';
import messages from '@/i18n/header';

const props = withDefaults(defineProps<{ homePath?: string }>(), { homePath: '/tricks' });

const { t } = useI18n({ messages, useScope: 'local' });
const { showBack, showHome, goBack, goHome } = useHistoryNav(() => props.homePath);

const sectionRef = ref<HTMLElement | null>(null);
const leftSlotRef = ref<HTMLElement | null>(null);
const rightSlotRef = ref<HTMLElement | null>(null);

const isMobile = useMediaQuery('(max-width: 1023.98px)');

const { sideWidthPx, containerHeightPx } = useSymmetricSlots(
  sectionRef,
  leftSlotRef,
  rightSlotRef,
  isMobile
);
const { offsetY } = useAutoHideOnScroll(containerHeightPx, isMobile);
</script>

<template>
  <!-- Spacer to offset fixed-position header on mobile -->
  <div class="lg:hidden" :style="{ height: `${containerHeightPx}px` }" aria-hidden="true" />

  <section
    ref="sectionRef"
    class="app-header fixed top-0 left-0 right-0 z-40 lg:hidden flex flex-col items-center px-3 py-2 bg-background drop-shadow"
    :style="{ transform: `translateY(${offsetY}px)` }"
  >
    <div
      class="w-full max-w-5xl grid grid-cols-[minmax(var(--side-w),auto)_minmax(0,1fr)_minmax(var(--side-w),auto)] items-center gap-2 min-h-10"
      :style="{ '--side-w': `${sideWidthPx}px` }"
    >
      <div ref="leftSlotRef" class="flex items-center justify-self-start">
        <Button v-if="showBack" size="icon" variant="ghost" :aria-label="t('back')" @click="goBack">
          <Icon icon="ic:round-arrow-back" class="h-6 w-6 text-foreground" />
        </Button>
        <Button v-if="showHome" size="icon" variant="ghost" :aria-label="t('home')" @click="goHome">
          <Icon icon="ic:round-home" class="h-6 w-6 text-foreground" />
        </Button>
      </div>

      <div class="min-w-0 w-full truncate text-xl font-semibold text-center">
        <slot></slot>
      </div>

      <div ref="rightSlotRef" class="flex items-center justify-self-end">
        <slot name="buttonsRight"></slot>
      </div>
    </div>
  </section>
</template>
