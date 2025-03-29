<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import DefaultLayout from '../layouts/DefaultLayout.vue';
import ErrorInfo from '@/components/ErrorInfo.vue';
import Section from '@/components/ui/section/Section.vue';
import messages from '../i18n/notFound';

const { t } = useI18n({
  messages,
  useScope: 'local',
});
</script>

<template>
  <DefaultLayout>
    <Section class="w-full h-full flex flex-col items-center justify-center">
      <ErrorInfo :title="t('heading')" :code="404" :description="t('body')" />
    </Section>
  </DefaultLayout>
</template>
