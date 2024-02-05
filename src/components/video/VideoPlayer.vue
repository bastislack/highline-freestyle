<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';

import messages from '@/i18n/video';
import YoutubePlayer from './platforms/YoutubePlayer.vue';
import InstagramPlayer from './platforms/InstagramPlayer.vue';
import Duration from './Duration.vue';

defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;

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

    if (['www.youtube.com', 'youtube.com', 'www.youtu.be.com', 'youtu.be'].includes(hostname)) {
      return Platform.YouTube;
    }

    if (['www.instagram.com', 'instagram.com'].includes(hostname)) {
      return Platform.Instagram;
    }
  } catch {
    return Platform.InvalidURL;
  }

  return Platform.Unknown;
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
        {{ t('error.only-youtube-and-insta') }}
      </div>

      <div class="text-center">
        {{ t('url') }}: <a :href="url" class="underline">{{ url }}</a
        ><br />
      </div>
      <Duration
        v-if="startTime || endTime"
        :start="startTime"
        :end="endTime"
        class="mt-1 mx-auto"
      />
    </div>

    <!-- Fallback if URL is invalid -->
    <div
      v-if="platformFromUrl(url) == Platform.InvalidURL"
      class="bg-muted text-muted-foreground border border-destructive p-3 lg:p-5 rounded-sm text-sm"
    >
      <div class="flex justify-center w-full text-destructive">
        <Icon icon="ic:baseline-link-off" class="w-8 h-8" />
      </div>
      <div class="text-lg text-center mb-3 lg:mb-5 text-destructive">
        {{ t('error.invalid-url') }}
      </div>

      <div class="text-center text-muted-foreground">
        {{ t('url') }}: <a :href="url" class="underline">{{ url }}</a>
        <br />
      </div>
      <Duration
        v-if="startTime || endTime"
        :start="startTime"
        :end="endTime"
        class="mt-1 mx-auto"
      />
    </div>
  </div>
</template>
