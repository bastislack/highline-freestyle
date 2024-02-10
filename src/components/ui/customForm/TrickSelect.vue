<script lang="ts" setup>
import { FormValidator } from '@/lib/formValidators/validatorMessages';
import { cn } from '@/lib/utils';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RuleExpression } from 'vee-validate';

const props = defineProps<{
  title: string;
  description: string;
  formFieldName: string;
  placeholder?: string;
  validator: FormValidator;
  class?: string;
}>();
</script>

<template>
  <FormField
    v-slot="{}"
    :name="formFieldName"
    :validate-on-change="true"
    :validate-on-input="true"
    :validate-on-blur="true"
    :rules="validator as RuleExpression<unknown>"
  >
    <FormItem :class="cn('flex flex-col justify-stretch', props.class)">
      <FormLabel class="font-bold"> {{ title }}</FormLabel>
      <FormDescription>
        {{ description }}
      </FormDescription>
      <FormMessage />
      <div class="flex-1" />
      <FormControl>
        <span class="border border-dashed rounded-lg border-slate-800 p-3">
          COMPONENT_NOT_IMPLEMENTED
        </span>
      </FormControl>
    </FormItem>
  </FormField>
</template>
