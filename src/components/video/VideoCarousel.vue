<script setup lang="ts">
import { Button } from '../ui/button';
import VideoPlayer from './VideoPlayer.vue';
import { Icon } from '@iconify/vue/dist/iconify.js';

type Video = {
  link: string;
  startTime?: number;
  endTime?: number;
};

defineProps<{
  videos: Video[];
}>();
</script>

<template>
  <div>
    <VideoPlayer
      :url="videos[0].link"
      :start-time="videos[0].startTime"
      :end-time="videos[0].endTime"
    />
  </div>

  <div class="flex flex-row justify-between mt-2">
    <Button variant="ghost" size="icon">
      <Icon icon="ic:baseline-keyboard-arrow-left" class="w-6 h-6" />
    </Button>
    <Button variant="ghost" size="icon">
      <Icon icon="ic:baseline-keyboard-arrow-right" class="w-6 h-6" />
    </Button>
  </div>
</template>
