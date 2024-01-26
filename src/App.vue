<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useFavicon, usePreferredColorScheme } from '@vueuse/core';

const browserTheme = usePreferredColorScheme();
const favicon = computed(() =>
  browserTheme.value === 'dark' ? 'favicon_light.ico' : 'favicon.ico'
);
useFavicon(favicon);

onMounted(async () => {
  // This imports the migration procedure that syncs the offical tricks and combos
  // Note that this is done in an async fashion. This way, that group of modules
  // can be split off the main bundle and be imported asynchronously.
  (await import('./lib/database/official/index')).default();
});
</script>

<template>
  <RouterView />
</template>
