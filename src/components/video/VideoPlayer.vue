<script setup lang="ts">
import YoutubePlayer from './platforms/YoutubePlayer.vue';

defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();
</script>

<template>
  <div class="w-full">
    <YoutubePlayer :url="url" :start-time="startTime" :end-time="endTime" />
  </div>
</template>
