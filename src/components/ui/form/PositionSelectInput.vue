<script lang="ts" setup>
import { computed } from 'vue';
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import GenericFormElement from './GenericFormElement.vue';

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

const inputClasses = computed(() => {
  const classes = `bg-gray-50 border  text-sm rounded-lg block w-full p-2.5`.split(' ');

  if (props.issues && props.issues.length > 0) {
    classes.push('border-red-300', 'text-red-600');
  } else {
    classes.push('border-gray-300', 'text-gray-900');
  }

  return classes;
});

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
    <select
      :value="value"
      @input="
        (event) =>
          emits('update:value', DbPositionZod.parse((event.target! as HTMLInputElement).value))
      "
      :id="id"
      :class="inputClasses"
    >
      <option :label="t(entry)" v-for="entry in selectableValues" :key="entry">
        {{ entry }}
      </option>
    </select>
  </GenericFormElement>
</template>
