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

/**
 * Takes a number of seconds and pretty prints in mm:ss notation
 * e.g. 54 -> 00:54
 *      125 -> 02:05
 */
function minutesSecondsFromSeconds(seconds: number): string {
  let minutes: number = Math.floor(seconds / 60);
  let remainingSeconds: number = Math.floor(seconds % 60);

  return zeroPadNumber(minutes, 2) + ':' + zeroPadNumber(remainingSeconds, 2);
}

function zeroPadNumber(number_: number, minLength: number): string {
  return number_.toString().padStart(minLength, '0');
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
