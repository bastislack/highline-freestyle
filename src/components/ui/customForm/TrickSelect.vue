<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/tricks/new/index';
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

const { t } = useI18n({
  messages: messages,
  scope: 'local',
});
</script>

<template>
  <FormField
    v-slot="{}"
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
        <span class="border border-dashed rounded-lg border-slate-800 p-3">
          {{ t('componentNotImplemented') }}
        </span>
      </FormControl>
    </FormItem>
  </FormField>
</template>
