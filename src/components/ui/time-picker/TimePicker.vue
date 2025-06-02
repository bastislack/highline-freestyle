<!--
  This component together with its parts (TimePickerInput.vue and
  time-picker-utils.ts) are heavily based on the work of data-diego and his code
  can be found here:
  https://github.com/unovue/shadcn-vue/issues/689

  The code was edited in a lot of places to adapt it to our usecase in this
  project, make things more Vue-like (from what I understand data-diego is
  primarily a React developer), fix typing issues and change the look and feel
  slightly. The behaviour of how to the cursor moves when typing was changed
  in a small way as well.
-->

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';

import { Label } from '@/components/ui/label';
import {
  Timestamp,
  TimestampSeconds,
  timestampToSeconds,
  secondsToTimestamp,
} from './time-picker-utils';
import TimePickerInput from './TimePickerInput.vue';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/ui/timePicker';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

const props = defineProps<{
  time: TimestampSeconds;
  withSeconds: boolean;
  withLabels?: boolean;
}>();

const emit = defineEmits(['update:time']);

const internalTimestamp = computed({
  get: () => secondsToTimestamp(props.time),
  set: (value: Timestamp) => emit('update:time', timestampToSeconds(value)),
});

const hourRef = useTemplateRef<HTMLInputElement>('hourRef');
const minuteRef = useTemplateRef<HTMLInputElement>('minuteRef');
const secondRef = useTemplateRef<HTMLInputElement>('secondRef');

const focusMinuteRef = () => minuteRef.value?.focus();
const focusHourRef = () => hourRef.value?.focus();
const focusSecondRef = () => secondRef.value?.focus();

function unfocusCurrentFocus() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function updateTimestamp(newTimestamp: Timestamp) {
  internalTimestamp.value = newTimestamp;
}
</script>

<template>
  <div class="flex items-center gap-[2px]">
    <div class="flex flex-col items-center gap-1">
      <Label v-if="withLabels" for="hours" class="text-xs">{{ t('label.hours') }}</Label>
      <TimePickerInput
        id="hours"
        picker="hours"
        :time="internalTimestamp"
        ref="hourRef"
        @rightFocus="focusMinuteRef"
        @update:time="updateTimestamp"
      />
    </div>
    <div v-if="!withLabels">:</div>
    <div class="flex flex-col items-center gap-1">
      <Label v-if="withLabels" for="minutes" class="text-xs">{{ t('label.minutes') }}</Label>
      <TimePickerInput
        id="hours"
        picker="minutes"
        :time="internalTimestamp"
        ref="minuteRef"
        @leftFocus="focusHourRef"
        @rightFocus="focusSecondRef"
        @update:time="updateTimestamp"
      />
    </div>
    <div v-if="!withLabels && withSeconds">:</div>
    <div v-if="withSeconds" class="flex flex-col items-center gap-1">
      <Label v-if="withLabels" for="seconds" class="text-xs">{{ t('label.seconds') }}</Label>
      <TimePickerInput
        id="hours"
        picker="seconds"
        :time="internalTimestamp"
        ref="secondRef"
        @leftFocus="focusMinuteRef"
        @rightFocus="unfocusCurrentFocus"
        @update:time="updateTimestamp"
      />
    </div>
  </div>
</template>
