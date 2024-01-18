<script setup lang="ts">
import Duration from '../Duration.vue';

defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();
</script>

<template>
  <div class="w-100 flex justify-center">
    <iframe
      class="aspect-[9/16] rounded-md"
      :src="url + '/embed'"
      allowtransparency="true"
      scrolling="no"
      title="video"
    ></iframe>
  </div>
  <Duration
    v-if="startTime || endTime"
    :start="startTime"
    :end="endTime"
    class="mx-auto mt-2 text-muted-foreground"
  />
</template>
