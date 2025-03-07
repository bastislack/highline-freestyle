<script lang="ts" setup>
import { ErrorMessage } from 'vee-validate';
import { toValue, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import messagesErrors from '@/i18n/error';
import { i18nMerge } from '@/i18n/i18nmerge';

import { useFormField } from './useFormField';

const { name, formMessageId } = useFormField();
const { t } = useI18n({
  messages: i18nMerge(messagesErrors),
  scope: 'local',
});

const props = defineProps<{
  // This is used to pass values for the message translation interpolation
  values?: Record<string, string>;
}>();

// Create a computed function to translate messages
const translateMessage = computed(() => {
  return (message: string) => {
    if (!message) return '';
    return t(message, props.values || {});
  };
});
</script>

<template>
  <ErrorMessage
    :id="formMessageId"
    as="p"
    :name="toValue(name)"
    class="text-sm font-medium text-destructive"
    v-slot="{ message }"
  >
    {{ message ? translateMessage(message) : '' }}
  </ErrorMessage>
</template>
