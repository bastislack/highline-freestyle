<script lang="ts" setup>
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  /**
   * Defines which Positions should be selectable.
   * Filter acts identical inner function of an array's `.filter(inner)`.
   *
   * This is optional. If no function is provided all values are permitted.
   */
  selectionFilter?: (position: z.infer<typeof DbPositionZod>) => boolean;
  class?: string;
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
  >
    <FormItem :class="cn('flex flex-col justify-stretch', props.class)">
      <FormLabel class="font-bold"> {{ title }}</FormLabel>
      <FormDescription v-if="description">
        {{ description }}
      </FormDescription>
      <FormMessage />
      <FormControl>
        <Select :model-value="value" @update:model-value="handleChange($event, true)">
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
