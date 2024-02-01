<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import TrickDetailsContent from '@/components/stickable/trick/TrickDetailsContent.vue';
import { DbTricksTableZod } from '@/lib/database/schemas/Version1Schema';
import Section from '@/components/ui/section/Section.vue';
import ErrorInfo from '@/components/ErrorInfo.vue';

import messages from '@/i18n/tricks/trickDetails';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

const route = useRoute();

function parseAndValidateId(): number | undefined {
  const raw = Number(route.params.id);
  const result = DbTricksTableZod._def.shape().id.safeParse(raw);
  return result.success ? result.data : undefined;
}

function parseAndValidateStatus(): 'official' | 'userDefined' | 'archived' | undefined {
  const raw = route.params.status;
  const result = DbTricksTableZod._def.shape().trickStatus.safeParse(raw);
  return result.success ? result.data : undefined;
}

let id = computed(() => {
  return parseAndValidateId();
});

let status = computed(() => {
  return parseAndValidateStatus();
});
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
