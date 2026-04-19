<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Button } from '@/components/ui/button';
import ImgLogoUrl from '@/assets/logo/logo_big.svg?url';

const HOME_PATH = '/tricks';

const route = useRoute();
const router = useRouter();

const prevPath = ref<string | null>(null);

function syncPrevPath() {
  prevPath.value = (window.history.state?.back as string | undefined) ?? null;
}

const isHome = computed(() => route.path === HOME_PATH);
const showBack = computed(() => !isHome.value && prevPath.value !== null);
const showHome = computed(() => !isHome.value && prevPath.value !== HOME_PATH);

function goBack() {
  router.back();
}

function goHome() {
  router.replace(HOME_PATH);
}

const offsetY = ref(0);
let lastScrollY = 0;

const sectionRef = ref<HTMLElement | null>(null);
const leftSlotRef = ref<HTMLElement | null>(null);
const rightSlotRef = ref<HTMLElement | null>(null);
const sideWidthPx = ref(0);
const headerHeightPx = ref(0);
let resizeObserver: ResizeObserver | null = null;

function updateMeasurements() {
  const leftW = leftSlotRef.value?.offsetWidth ?? 0;
  const rightW = rightSlotRef.value?.offsetWidth ?? 0;
  sideWidthPx.value = Math.max(leftW, rightW);
  headerHeightPx.value = sectionRef.value?.offsetHeight ?? 0;
}

function onScroll() {
  const currentY = window.scrollY;
  if (currentY <= 0) {
    offsetY.value = 0;
    lastScrollY = 0;
    return;
  }
  const delta = currentY - lastScrollY;
  offsetY.value = Math.max(-headerHeightPx.value, Math.min(0, offsetY.value - delta));
  lastScrollY = currentY;
}

onMounted(() => {
  syncPrevPath();
  window.addEventListener('scroll', onScroll, { passive: true });
  resizeObserver = new ResizeObserver(updateMeasurements);
  if (sectionRef.value) resizeObserver.observe(sectionRef.value);
  if (leftSlotRef.value) resizeObserver.observe(leftSlotRef.value);
  if (rightSlotRef.value) resizeObserver.observe(rightSlotRef.value);
  updateMeasurements();
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(() => route.fullPath, syncPrevPath);
</script>

<template>
  <!-- Spacer to offset fixed-position header on mobile -->
  <div class="lg:hidden" :style="{ height: `${headerHeightPx}px` }" aria-hidden="true" />

  <section
    ref="sectionRef"
    class="app-header fixed top-0 left-0 right-0 z-40 lg:hidden flex flex-col items-center px-3 py-2 bg-background drop-shadow"
    :style="{ transform: `translateY(${offsetY}px)` }"
  >
    <div
      class="w-full max-w-5xl grid grid-cols-[minmax(var(--side-w),auto)_minmax(0,1fr)_minmax(var(--side-w),auto)] items-center gap-2 min-h-10"
      :style="{ '--side-w': `${sideWidthPx}px` }"
    >
      <div ref="leftSlotRef" class="flex items-center justify-self-start gap-0">
        <Button v-if="showBack" size="icon" variant="ghost" @click="goBack">
          <Icon icon="ic:round-arrow-back" class="h-6 w-6 text-black" />
        </Button>
        <Button v-if="showHome" size="icon" variant="ghost" @click="goHome">
          <Icon icon="ic:round-home" class="h-6 w-6 text-black" />
        </Button>
      </div>

      <div class="min-w-0 w-full truncate text-xl font-semibold text-center">
        <img
          v-if="isHome"
          :src="ImgLogoUrl"
          class="h-10 max-w-full object-contain mx-auto"
          alt="Logo"
        />
        <slot v-else></slot>
      </div>

      <div ref="rightSlotRef" class="flex items-center justify-self-end gap-0">
        <slot name="buttonsRight"></slot>
      </div>
    </div>
  </section>
</template>
