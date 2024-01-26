<script setup lang="ts">
import { onMounted } from 'vue';
import Toaster from './components/ui/toast/Toaster.vue';

onMounted(async () => {
  // This imports the migration procedure that syncs the offical tricks and combos
  // Note that this is done in an async fashion. This way, that group of modules
  // can be split off the main bundle and be imported asynchronously.
  (await import('./lib/database/official/index')).default();
});
</script>

<template>
  <RouterView />
  <Toaster />
</template>
