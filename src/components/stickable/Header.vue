<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Button } from '@/components/ui/button';
import ImgLogoUrl from '@/assets/logo/logo_big.svg?url';

const HOME_PATH = '/tricks';
const HEADER_HEIGHT_PX = 56;
const DESKTOP_BREAKPOINT_PX = 1024;

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

function onScroll() {
  if (window.innerWidth >= DESKTOP_BREAKPOINT_PX) {
    offsetY.value = 0;
    lastScrollY = window.scrollY;
    return;
  }
  const currentY = window.scrollY;
  if (currentY <= 0) {
    offsetY.value = 0;
    lastScrollY = 0;
    return;
  }
  const delta = currentY - lastScrollY;
  offsetY.value = Math.max(-HEADER_HEIGHT_PX, Math.min(0, offsetY.value - delta));
  lastScrollY = currentY;
}

onMounted(() => {
  syncPrevPath();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(() => route.fullPath, syncPrevPath);
</script>

<template>
  <!-- Spacer to offset fixed-position header on mobile -->
  <div class="h-14 lg:hidden" aria-hidden="true" />

  <section
    class="fixed top-0 left-0 right-0 z-40 lg:static flex flex-col items-center px-3 py-2 bg-background drop-shadow"
    :style="{ transform: `translateY(${offsetY}px)` }"
  >
    <div class="w-full max-w-5xl grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-h-10">
      <div class="flex items-center justify-self-start min-w-0 gap-0">
        <Button v-if="showBack" size="icon" variant="ghost" @click="goBack">
          <Icon icon="ic:round-arrow-back" class="h-6 w-6 text-black" />
        </Button>
        <Button v-if="showHome" size="icon" variant="ghost" @click="goHome">
          <Icon icon="ic:round-home" class="h-6 w-6 text-black" />
        </Button>
      </div>

      <div class="justify-self-center min-w-0 max-w-full truncate text-lg text-center">
        <img v-if="isHome" :src="ImgLogoUrl" class="h-8 mx-auto" alt="Logo" />
        <slot v-else></slot>
      </div>

      <div class="flex items-center justify-self-end min-w-0 gap-0">
        <slot name="buttonsRight"></slot>
      </div>
    </div>
  </section>
</template>
