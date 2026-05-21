<script lang="ts" setup>
import Input from '@/components/ui/input/Input.vue';
import { cn } from '@/lib/utils';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputHTMLAttributes } from 'vue';

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  placeholder?: string;
  class?: string;
  inputMode?: InputHTMLAttributes['inputmode'];
  type?: InputHTMLAttributes['type'];
  required?: boolean;
  // This is used to pass values for the message translation interpolation
  errorValues?: Record<string, string>;
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
      <FormLabel class="font-bold">
        {{ title }}<span v-if="required" class="text-destructive" aria-hidden="true"> *</span>
      </FormLabel>
      <FormDescription v-if="description">
        {{ description }}
      </FormDescription>
      <FormMessage :values="props.errorValues" />
      <FormControl>
        <Input
          :type="type || 'text'"
          :placeholder="placeholder"
          :inputMode="inputMode"
          v-bind="componentField"
        />
      </FormControl>
    </FormItem>
  </FormField>
</template>
