<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import messages from '@/i18n/settings';

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;
</script>

<template>
  <div class="text-3xl">{{ t('heading-settings') }}</div>
</template>
