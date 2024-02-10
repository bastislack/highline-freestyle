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
  class?: string;
  inputClass?: string;
  validator: FormValidator;
}>();
</script>

<template>
  <FormField
    v-slot="{ componentField }"
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
        <textarea
          :placeholder="placeholder"
          v-bind="componentField"
          :class="
            cn(
              'flex min-h-[40px] h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              props.inputClass
            )
          "
        />
      </FormControl>
    </FormItem>
  </FormField>
</template>
