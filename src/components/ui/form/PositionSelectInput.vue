<script lang="ts" setup>
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import GenericFormElement from './GenericFormElement.vue';

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

const props = defineProps<{
  id: string;
  name: string;
  description?: string;
  issues?: string[];
  value: z.infer<typeof DbPositionZod>;
  /**
   * Defines which Positions should be selectable.
   * Filter acts identical inner function of an array's `.filter(inner)`.
   *
   * This is optional. If no function is provided all values are permitted.
   */
  selectionFilter?: (position: z.infer<typeof DbPositionZod>) => boolean;
}>();

const emits = defineEmits<{
  (eventName: 'update:value', newValue: z.infer<typeof DbPositionZod>): void;
}>();

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
  <GenericFormElement :description="description" :id="id" :name="name" :issues="issues">
    <Select
      :model-value="value"
      @update:model-value="
        (e) => {
          emits('update:value', DbPositionZod.parse((e as any).value));
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
  </GenericFormElement>
</template>
