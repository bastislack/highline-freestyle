<script setup lang="ts">
defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();
</script>

<template>
  <div class="text-center">
    <span class="text-xl">Instagram embed</span><br />
    URL: {{ url }}<br />
    Start: {{ startTime }}<br />
    End: {{ endTime }}
  </div>
</template>
