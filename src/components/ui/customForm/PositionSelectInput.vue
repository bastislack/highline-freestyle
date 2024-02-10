<script lang="ts" setup>
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import { FormValidator } from '@/lib/formValidators/validatorMessages';

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
  validator: FormValidator;
  /**
   * Defines which Positions should be selectable.
   * Filter acts identical inner function of an array's `.filter(inner)`.
   *
   * This is optional. If no function is provided all values are permitted.
   */
  selectionFilter?: (position: z.infer<typeof DbPositionZod>) => boolean;
}>();

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { z } from 'zod';
import { useI18n } from 'vue-i18n';

import messages from '@/i18n/common/positions';

const { t } = useI18n({
  messages,
  scope: 'local',
});

const selectableValues = props.selectionFilter
  ? Object.values(DbPositionZod.Values).filter(props.selectionFilter)
  : Object.values(DbPositionZod.Values);
</script>

<template>
  <FormField
    v-slot="{ value, handleChange }"
    :name="formFieldName"
    :validate-on-change="true"
    :validate-on-input="true"
    :validate-on-blur="true"
    :rules="validator as RuleExpression<unknown>"
  >
    <FormItem class="flex flex-col justify-stretch">
      <FormLabel class="font-bold"> {{ title }}</FormLabel>
      <FormDescription>
        {{ description }}
      </FormDescription>
      <FormMessage />
      <div class="flex-1" />
      <FormControl>
        <Select
          :model-value="value"
          @update:model-value="
            (e) => {
              const selectedValue = (e as any as { value: z.infer<typeof DbPositionZod> }).value;
              handleChange(selectedValue, true);
            }
          "
        >
          <SelectTrigger>
            <SelectValue :placeholder="value">{{ value }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="entry" v-for="entry of selectableValues" :key="entry">
                {{ t(entry) }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormControl>
    </FormItem>
  </FormField>
</template>
