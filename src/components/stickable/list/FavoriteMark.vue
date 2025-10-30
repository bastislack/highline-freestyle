<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';

defineProps<{ show: boolean }>();
</script>

<template>
  <div v-if="show" class="absolute top-1 left-1">
    <Icon icon="ic:round-star" class="h-5 w-5" />
  </div>
</template>
