<script setup lang="ts">
import { ref, computed } from 'vue';
import { Input } from '@/components/ui/input';
import {
  getArrowByType,
  getTimestampFieldAsString,
  setTimestampByType,
  Timestamp,
  TimePickerType,
} from './time-picker-utils';
import { cn } from '@/lib/utils';

const props = defineProps<{
  picker: TimePickerType;
  time: Timestamp;
  class?: string;
}>();

const emit = defineEmits(['update:time', 'rightFocus', 'leftFocus']);

const focusOnSecondDigit = ref(false);

const inputClasses = computed(() =>
  cn(
    'w-[34px] px-0 text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none',
    props.class
  )
);

const calculatedValue = computed(() => getTimestampFieldAsString(props.time, props.picker));

function calculateNewValue(key: string): string {
  return focusOnSecondDigit.value ? calculatedValue.value.slice(1, 2) + key : '0' + key;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Tab') return;

  event.preventDefault();

  if (event.key === 'ArrowRight') emit('rightFocus');
  if (event.key === 'ArrowLeft') emit('leftFocus');
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    const step = event.key === 'ArrowUp' ? 1 : -1;
    const newValue = getArrowByType(calculatedValue.value, step, props.picker);
    if (focusOnSecondDigit.value) focusOnSecondDigit.value = false;
    const tmpTime = new Timestamp(props.time.hours, props.time.minutes, props.time.seconds);
    emit('update:time', setTimestampByType(tmpTime, newValue, props.picker));
  }
  if (event.key >= '0' && event.key <= '9') {
    const newValue = calculateNewValue(event.key);
    const tmpTime = new Timestamp(props.time.hours, props.time.minutes, props.time.seconds);
    emit('update:time', setTimestampByType(tmpTime, newValue, props.picker));

    if (focusOnSecondDigit.value) {
      emit('rightFocus');
    }

    focusOnSecondDigit.value = !focusOnSecondDigit.value;
  }
}
</script>

<template>
  <Input
    :id="picker"
    :name="picker"
    :class="inputClasses"
    :value="calculatedValue"
    :defaultValue="calculatedValue"
    type="tel"
    inputmode="decimal"
    @keydown="handleKeyDown"
    @focusout="() => (focusOnSecondDigit = false)"
  />
</template>
