<script lang="ts" setup>
import { computed } from 'vue';
import GenericFormElement from './GenericFormElement.vue';

const props = defineProps<{
  id: string;
  name: string;
  description?: string;
  issues?: string[];
  value: number | undefined;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}>();

const emits = defineEmits<{
  (eventName: 'update:value', newValue: number | undefined): void;
}>();

const inputClasses = computed(() => {
  const classes = `bg-gray-50 border  text-sm rounded-lg block w-full p-2.5`.split(' ');

  if (props.issues && props.issues.length > 0) {
    classes.push('border-red-300', 'text-red-600');
  } else {
    classes.push('border-gray-300', 'text-gray-900');
  }

  return classes;
});

function extractValue(input: string) {
  if (input.trim().length === 0 || Number.isNaN(Number(input))) {
    return undefined;
  }

  return Number(input);
}
</script>

<template>
  <GenericFormElement :description="description" :id="id" :name="name" :issues="issues">
    <input
      :value="value"
      @input="
        (event) =>
          emits('update:value', extractValue((event.target! as HTMLInputElement).value as string))
      "
      type="number"
      :id="id"
      :class="inputClasses"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :step="step"
    />
  </GenericFormElement>
</template>
