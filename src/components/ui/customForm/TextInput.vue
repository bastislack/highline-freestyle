<script lang="ts" setup>
import Input from '@/components/ui/input/Input.vue';
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
        <Input type="text" :placeholder="placeholder" v-bind="componentField" />
      </FormControl>
    </FormItem>
  </FormField>
</template>
