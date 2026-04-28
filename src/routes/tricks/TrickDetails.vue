<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import TrickDetailsContent from '@/components/stickable/trick/TrickDetailsContent.vue';
import Section from '@/components/ui/section/Section.vue';
import ErrorInfo from '@/components/ErrorInfo.vue';

import messages from '@/i18n/tricks/trickDetails';
import { useTrickRouteParams } from '@/composables/useTrickRouteParams';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;
const { id, status } = useTrickRouteParams();
</script>

<template>
  <DefaultLayout>
    <Section v-if="!status" class="w-full h-full flex flex-col items-center justify-center">
      <ErrorInfo
        :code="422"
        :title="t('error.invalid-status.title')"
        :description="t('error.invalid-status.description')"
      />
    </Section>
    <Section v-else-if="!id" class="w-full h-full flex flex-col items-center justify-center">
      <ErrorInfo
        :code="422"
        :title="t('error.invalid-id.title')"
        :description="t('error.invalid-id.description')"
      />
    </Section>
    <TrickDetailsContent v-else class="w-full h-full" :status="status" :id="id" />
  </DefaultLayout>
</template>
