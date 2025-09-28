<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { useI18n } from 'vue-i18n';

import messages from '@/i18n/video';
import Duration from '../Duration.vue';
import EmbedPrompt from '../EmbedPrompt.vue';
import { isEmbedAllowed } from '@/util/trackingPreferences';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

const props = defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;

const playerRef = ref<HTMLDivElement | null>(null);
let player: YT.Player | null = null;

const isUrlValid = computed(() => {
  try {
    videoIdFromURL(props.url);
    return true;
  } catch {
    return false;
  }
});

onMounted(() => {
  if (isUrlValid.value && playerRef.value) {
    loadYouTubeAPI();
  }
});

watch(() => [props.url, props.startTime, props.endTime], () => {
  if (player) {
    const videoId = videoIdFromURL(props.url);
    player.loadVideoById({
      videoId,
      startSeconds: props.startTime,
      endSeconds: props.endTime,
    });
  } else if (isUrlValid.value && playerRef.value) {
    loadYouTubeAPI();
  }
});

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    createPlayer();
  } else {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = createPlayer;
  }
}

function createPlayer() {
  if (!playerRef.value) return;

  const videoId = videoIdFromURL(props.url);

  player = new window.YT.Player(playerRef.value, {
    videoId: videoId,
    playerVars: {
      start: props.startTime,
      end: props.endTime,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady() {
  player?.mute();
}

function onPlayerStateChange(event: YT.OnStateChangeEvent) {
  if (event.data === window.YT.PlayerState.ENDED) {
    player?.seekTo(props.startTime ?? 0, true);
  }
}

/**
 * Parsing out the video ID from a YouTube url. The solution was take from
 * https://stackoverflow.com/a/8260383
 * @param url Youtube URL in any format (youtube.com, youtu.be, ...)
 */
function videoIdFromURL(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[7].length === 11) {
    return match[7];
  }
  throw new Error('Invalid YouTube link!');
}
</script>

<template>
  <EmbedPrompt v-if="!isEmbedAllowed('YOUTUBE')" site="YOUTUBE" />

  <div v-else-if="isUrlValid">
    <div class="videowrapper">
      <div ref="playerRef"></div>
    </div>
    <Duration
      v-if="startTime || endTime"
      :start="startTime"
      :end="endTime"
      class="mx-auto mt-2 text-muted-foreground"
    />
  </div>

  <div
    v-else
    class="w-full bg-muted text-muted-foreground border border-border p-3 lg:p-5 rounded-sm text-sm"
  >
    <div class="flex justify-center w-full">
      <Icon icon="ic:baseline-videocam-off" class="w-8 h-8" />
    </div>
    <div class="text-lg text-center mb-3 lg:mb-5">
      {{ t('error.invalid-youtube') }}
    </div>

    <div class="text-center">
      {{ t('url') }}: <a :href="url" class="underline">{{ url }}</a><br />
    </div>
    <Duration v-if="startTime || endTime" :start="startTime" :end="endTime" class="mt-1 mx-auto" />
  </div>
</template>

<style>
/*
 * Used to scale the embed to the full width available to it.
 * Taken from https://css-tricks.com/fluid-width-video
 */
.videowrapper {
  float: none;
  clear: both;
  width: 100%;
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 25px;
  height: 0;
}
.videowrapper > div,
.videowrapper > iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
