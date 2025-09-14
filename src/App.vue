<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Toaster from './components/ui/toast/Toaster.vue';

// Only used for rerendering the RouterView component
const routerViewKey = ref(0);

function forceRerender() {
  routerViewKey.value += 1;
}

onMounted(async () => {
  // This imports the migration procedure that syncs the offical tricks and combos
  // Note that this is done in an async fashion. This way, that group of modules
  // can be split off the main bundle and be imported asynchronously.
  await (await import('./lib/database/official/index')).default();
  forceRerender();
});
</script>

<template>
  <RouterView :key="routerViewKey" />
  <Toaster />
</template>
