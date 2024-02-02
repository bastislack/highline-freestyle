<script lang="ts" setup>
import { computed } from 'vue';
import GenericFormElement from './GenericFormElement.vue';

const props = defineProps<{
  id: string;
  name: string;
  description?: string;
  issues?: string[];
  value: string;
  placeholder?: string;
  multiline?: boolean;
  typeOverride?: string;
}>();

const emits = defineEmits<{
  (eventName: 'update:value', newValue: string): void;
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
</script>

<template>
  <GenericFormElement :description="description" :id="id" :name="name" :issues="issues">
    <textarea
      v-if="multiline"
      :id="id"
      :class="inputClasses"
      :placeholder="placeholder"
      :value="value"
      @input="(event) => emits('update:value', (event.target! as HTMLInputElement).value)"
    ></textarea>
    <input
      v-else
      :value="value"
      @input="(event) => emits('update:value', (event.target! as HTMLInputElement).value)"
      :type="typeOverride ?? 'text'"
      :id="id"
      class="bg-gray-50 border text-sm rounded-lg block w-full p-2.5 focus:outline focus:outline-primary-700 focus:invalid:outline-red-700"
      :placeholder="placeholder"
    />
  </GenericFormElement>
</template>
