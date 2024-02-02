<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { useI18n } from 'vue-i18n';

import messages from '@/i18n/video';
import Duration from '../Duration.vue';

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

const isUrlValid = computed(() => {
  try {
    videoIdFromURL(props.url);
    return true;
  } catch {
    return false;
  }
});

function embedURLfromRegularURL(url_: string, startTime_?: number, endTime_?: number): string {
  if (!isUrlValid.value) {
    return '';
  }

  const prefix: string = 'https://www.youtube-nocookie.com/embed/';

  const videoID: string = videoIdFromURL(url_);

  let suffix: string = startTime_ || endTime_ ? '?version=3&loop=1&modestbranding=1&' : '';
  suffix += startTime_ ? 'start=' + startTime_ : '';
  suffix += startTime_ && endTime_ ? '&' : '';
  suffix += endTime_ ? 'end=' + endTime_ : '';

  console.log(prefix + videoID + suffix);

  return prefix + videoID + suffix;
}

/**
 * Parsing out the video ID from a YouTube url. The solution was take from
 * https://stackoverflow.com/a/8260383
 * @param url Youtube URL in any format (youtube.com, youtu.be, ...)
 */
function videoIdFromURL(url_: string): string {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url_.match(regExp);
  if (match && match[7].length == 11) {
    return match[7];
  }
  throw Error('Invalid YouTube link!');
}
</script>

<template>
  <div v-if="isUrlValid">
    <div class="videowrapper">
      <iframe
        width="560"
        height="315"
        :src="embedURLfromRegularURL(url, startTime, endTime)"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
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
      {{ t('url') }}: <a :href="url" class="underline">{{ url }}</a
      ><br />
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
.videowrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
