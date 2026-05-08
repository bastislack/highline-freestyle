<script setup lang="ts">
import { useTemplateRef, type HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/lib/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
  // v-model on <input> suppresses updates during IME composition. On Android
  // soft keyboards every letter is part of a composition (autocomplete /
  // swipe-typing), so v-model only updates on space, digits, or punctuation.
  // Opt-in flag for fields where intermediate composition state matters more
  // than CJK IME correctness (e.g. fuzzy-search text inputs).
  composeImmediate?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const input = useTemplateRef<HTMLInputElement>('input');

function focus() {
  input.value?.focus();
}

function onInput(event: Event) {
  if (!props.composeImmediate) return;
  // v-model on <input> skips updates while IME composition is active. On
  // Android soft keyboards every letter is part of composition, so the bound
  // model only updates on space, digit, or punctuation. This second listener
  // reads the current value on every native input event, beating v-model's
  // internal guard.
  const target = event.target as HTMLInputElement;
  modelValue.value = target.value;
}

defineExpose({
  focus,
});
</script>

<template>
  <input
    v-model="modelValue"
    @input="onInput"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
    ref="input"
  />
</template>
