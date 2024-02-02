<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  id: string;
  name: string;
  description?: string;
  issues?: string[];
}>();

const inputClasses = computed(() => {
  const classes = `bg-gray-50 border text-sm rounded-lg block w-full p-2.5`.split(' ');

  if (props.issues && props.issues.length > 0) {
    classes.push('border-red-300', 'text-red-600');
  } else {
    classes.push('border-gray-300', 'text-gray-900');
  }

  return classes;
});
</script>

<template>
  <div class="inline-flex flex-col">
    <label :for="id" class="inline-flex flex-col mb-2 flex-1 text-gray-900">
      <span class="text-lg font-medium">{{ name }}</span>
      <span v-if="description" class="text-gray-600 text-sm"> {{ description }}</span>
      <span :key="i" class="text-red-600 text-sm" v-for="(issue, i) of issues ?? []">
        {{ issue }}
      </span>
    </label>
    <slot :class="inputClasses" />
  </div>
</template>
