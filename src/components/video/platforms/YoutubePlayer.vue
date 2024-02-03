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

const isClipUrl = (url: string) => {
  let params: URLSearchParams;
  try {
    params = new URL(url).searchParams;
  } catch (err) {
    console.error({
      message: 'Trick contains a URL that could not be parsed',
      err,
    });
    return false;
  }

  if (!params.get('clip')) {
    return false;
  }

  if (!['clipt', 'amp;clipt'].some((e) => params.get(e))) {
    return false;
  }

  return true;
};

function embedURLfromRegularURL(url: string, startTime?: number, endTime?: number): string {
  if (!isUrlValid.value) {
    return '';
  }

  if (isClipUrl(url)) {
    // We can just embed the URL directly. In this instance, start and end times are ignored entirely

    const { pathname, search } = new URL(url);
    const newUrl = new URL(pathname + search, 'https://www.youtube.com').toString();
    return newUrl;
  }

  const searchParams = {
    version: '3',
    loop: '1',
    modestbranding: '1',
    ...(startTime && { start: String(startTime) }),
    ...(endTime && { end: String(endTime) }),
  };

  const videoID: string = videoIdFromURL(url);

  const newUrl = new URL(`/embed/${videoID}`, 'https://www.youtube-nocookie.com');

  for (const [key, value] of Object.entries(searchParams)) {
    newUrl.searchParams.append(key, value);
  }

  console.log(newUrl.toString());
  return newUrl.toString();
}

/**
 * Parsing out the video ID from a YouTube url. The solution was take from
 * https://stackoverflow.com/a/8260383
 * @param url Youtube URL in any format (youtube.com, youtu.be, ...)
 */
function videoIdFromURL(url: string): string {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
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
