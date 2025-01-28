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

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  placeholder?: string;
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
      <FormLabel class="font-bold"> {{ title }}</FormLabel>
      <FormDescription v-if="description">
        {{ description }}
      </FormDescription>
      <FormMessage />
      <FormControl>
        <Input type="text" :placeholder="placeholder" v-bind="componentField" />
      </FormControl>
    </FormItem>
  </FormField>
</template>
