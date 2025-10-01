<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';

defineProps<{ show: boolean }>();
</script>

<template>
  <div v-if="show">
    <Icon icon="ic:round-star" class="absolute top-1 right-1 h-5 w-5 z-10" />
  </div>
</template>
