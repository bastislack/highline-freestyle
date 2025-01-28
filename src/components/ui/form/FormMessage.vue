<script lang="ts" setup>
import { ErrorMessage } from 'vee-validate';
import { toValue } from 'vue';
import { useI18n } from 'vue-i18n';

import messagesErrors from '@/i18n/error';

import { useFormField } from './useFormField';

const { name, formMessageId } = useFormField();

const { t } = useI18n({
  messages: messagesErrors,
  scope: 'local',
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
    {{ message ? t(message) : '' }}
  </ErrorMessage>
</template>
