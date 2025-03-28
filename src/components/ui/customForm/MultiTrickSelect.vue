<script lang="ts" setup>
import { cn } from '@/lib/utils';
import { FormField, FormLabel, FormItem, FormDescription, FormControl, FormMessage } from '../form';

// This component is split somewhat awkwardly into two components.
// This one and the following one. This is due to the need for perfroming
// more "complex" functionality utilizing the componentField, which is
// passed down from the FormField through its v-slot.
import MultiTrickSelectInternal from './MultiTrickSelectInternal.vue';

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  class?: string;
}>();
</script>

<template>
  <FormField
    v-slot="{ componentField }"
    :name="formFieldName"
    :validate-on-change="true"
    :validate-on-input="true"
    :validate-on-blur="true"
  >
    <FormItem :class="cn('flex flex-col justify-stretch', props.class)">
      <FormLabel class="font-bold">{{ title }}</FormLabel>
      <FormDescription v-if="description">
        {{ description }}
      </FormDescription>
      <FormMessage />

      <FormControl>
        <MultiTrickSelectInternal v-bind:selected="componentField.modelValue" />
      </FormControl>
    </FormItem>
  </FormField>
</template>
