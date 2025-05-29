<script setup lang="ts">
import { ref, computed } from 'vue';

import { Label } from '@/components/ui/label';
import {
  Timestamp,
  TimestampSeconds,
  timestampToSeconds,
  secondsToTimestamp,
} from './time-picker-utils';
import TimePickerInput from './TimePickerInput.vue';

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

const hourRef = ref(null);
const minuteRef = ref(null);
const secondRef = ref(null);

const focusMinuteRef = () => minuteRef.value?.$el.focus();
const focusHourRef = () => hourRef.value?.$el.focus();
const focusSecondRef = () => secondRef.value?.$el.focus();

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
      <Label v-if="withLabels" for="hours" class="text-xs">Hours</Label>
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
      <Label v-if="withLabels" for="minutes" class="text-xs">Minutes</Label>
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
      <Label v-if="withLabels" for="seconds" class="text-xs">Seconds</Label>
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
