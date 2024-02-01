<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';

import messages from '@/i18n/video';

defineProps<{
  start?: number;
  end?: number;
}>();

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;

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
  <div v-if="start || end" class="flex flex-row gap-7 justify-center w-64 text-sm">
    <div v-if="start" class="flex flex-row gap-1">
      <Icon icon="ic:round-play-arrow" class="w-5 h-5" />
      {{ minutesSecondsFromSeconds(start) }}
    </div>
    <div v-if="start && end">{{ t('duration.to') }}</div>
    <div v-if="end" class="flex flex-row gap-1">
      <Icon icon="ic:round-stop" class="w-5 h-5" />
      {{ minutesSecondsFromSeconds(end) }}
    </div>
  </div>
  <div v-else class="text-muted-foreground">{{ t('duration.not-specified') }}</div>
</template>
