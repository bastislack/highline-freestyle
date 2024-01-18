<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '../ui/button';
import { Icon } from '@iconify/vue/dist/iconify.js';

import VideoPlayer from './VideoPlayer.vue';

type Video = {
  link: string;
  startTime?: number;
  endTime?: number;
};

const props = defineProps<{
  videos: Video[];
}>();

let currentVideoIndex = ref<number>(0);
let isCurrentVideoFirst = ref<boolean>(true);
let isCurrentVideoLast = ref<boolean>(false);

watch(currentVideoIndex, () => {
  isCurrentVideoFirst.value = currentVideoIndex.value == 0;
  isCurrentVideoLast.value = currentVideoIndex.value == props.videos.length - 1;
});

function skipToNext() {
  currentVideoIndex.value = Math.min(currentVideoIndex.value + 1, props.videos.length - 1);
}

function skipToPrev() {
  currentVideoIndex.value = Math.max(currentVideoIndex.value - 1, 0);
}
</script>

<template>
  <div v-if="videos && videos.length > 0">
    <VideoPlayer
      :url="videos[currentVideoIndex].link"
      :start-time="videos[currentVideoIndex].startTime"
      :end-time="videos[currentVideoIndex].endTime"
    />
  </div>

  <div
    v-if="videos && videos.length > 1"
    class="flex flex-row justify-between align-middle mt-4 lg:mt-5"
  >
    <Button
      @click="skipToPrev"
      variant="ghost"
      size="icon"
      class="text-primary hover:text-primary-700"
      :disabled="isCurrentVideoFirst"
    >
      <Icon icon="ic:baseline-keyboard-arrow-left" class="w-6 h-6" />
    </Button>

    <div class="text-muted-foreground self-center text-sm">
      <span class="text-foreground font-medium">{{ currentVideoIndex + 1 }}</span> /
      {{ videos.length }}
    </div>

    <Button
      @click="skipToNext"
      variant="ghost"
      size="icon"
      class="text-primary hover:text-primary-700"
      :disabled="isCurrentVideoLast"
    >
      <Icon icon="ic:baseline-keyboard-arrow-right" class="w-6 h-6" />
    </Button>
  </div>
</template>
