<script setup lang="ts">
defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();

function embedURLfromRegularURL(url_: string, startTime_?: number, endTime_?: number): string {
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
