<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';

import YoutubePlayer from './platforms/YoutubePlayer.vue';
import InstagramPlayer from './platforms/InstagramPlayer.vue';

defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();

enum Platform {
  InvalidURL,
  Unknown,
  YouTube,
  Instagram,
}

function hostnameFromUrl(url_: string): string {
  const urlObj: URL = new URL(url_);
  return urlObj.hostname;
}

function platformFromUrl(url_: string): Platform {
  try {
    const hostname = hostnameFromUrl(url_);

    if (['youtube.com', 'youtu.be'].includes(hostname)) {
      return Platform.YouTube;
    }

    if (['instagram.com'].includes(hostname)) {
      return Platform.Instagram;
    }
  } catch {
    return Platform.InvalidURL;
  }

  return Platform.Unknown;
}

function minutesSecondsFromSeconds(seconds: number): string {
  let minutes: number = Math.floor(seconds / 60);
  let remainingSeconds: number = Math.floor(seconds % 60);

  return numToString(minutes, 2) + ':' + numToString(remainingSeconds, 2);
}

function numToString(number_: number, minLength: number): string {
  let numAsString = number_.toString();

  while (numAsString.length < minLength) {
    numAsString = '0' + numAsString;
  }

  return numAsString;
}
</script>

<template>
  <div class="w-full">
    <YoutubePlayer
      v-if="platformFromUrl(url) == Platform.YouTube"
      :url="url"
      :start-time="startTime"
      :end-time="endTime"
    />

    <InstagramPlayer
      v-if="platformFromUrl(url) == Platform.Instagram"
      :url="url"
      :start-time="startTime"
      :end-time="endTime"
    />

    <!-- Fallback if video can't be displayed -->
    <div
      v-if="platformFromUrl(url) == Platform.Unknown"
      class="bg-muted text-muted-foreground border border-border p-3 lg:p-5 rounded-sm text-sm"
    >
      <div class="flex justify-center w-full">
        <Icon icon="ic:baseline-videocam-off" class="w-8 h-8" />
      </div>
      <div class="text-lg text-center mb-3 lg:mb-5">
        Only YouTube and Instagram videos can be displayed!
      </div>

      <div class="text-center">
        URL: <a :href="url" class="underline">{{ url }}</a
        ><br />
      </div>
      <div v-if="startTime || endTime" class="flex flex-row justify-center gap-5 mt-1">
        <div v-if="startTime">Start: {{ minutesSecondsFromSeconds(startTime) }}<br /></div>
        <div v-if="endTime">End: {{ minutesSecondsFromSeconds(endTime) }}</div>
      </div>
    </div>

    <!-- Fallback if URL is invalid -->
    <div
      v-if="platformFromUrl(url) == Platform.InvalidURL"
      class="bg-muted text-muted-foreground border border-destructive p-3 lg:p-5 rounded-sm text-sm"
    >
      <div class="flex justify-center w-full text-destructive">
        <Icon icon="ic:baseline-link-off" class="w-8 h-8" />
      </div>
      <div class="text-lg text-center mb-3 lg:mb-5 text-destructive">Invalid video URL!</div>

      <div class="text-center text-muted-foreground">
        URL: <a :href="url" class="underline">{{ url }}</a
        ><br />
      </div>
      <div
        v-if="startTime || endTime"
        class="flex flex-row justify-center gap-5 mt-1 text-muted-foreground"
      >
        <div v-if="startTime">Start: {{ minutesSecondsFromSeconds(startTime) }}<br /></div>
        <div v-if="endTime">End: {{ minutesSecondsFromSeconds(endTime) }}</div>
      </div>
    </div>
  </div>
</template>
