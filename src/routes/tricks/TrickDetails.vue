<script lang="ts" setup>
import { useRoute } from 'vue-router';
//import { z } from 'zod';
import { computed } from 'vue';
//import { useI18n } from 'vue-i18n';
//import { Icon } from '@iconify/vue';

//import Separator from '@/components/ui/separator/Separator.vue';
//import Badge from '@/components/ui/badge/Badge.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
//import InfoElement from '@/components/stickable/InfoElement.vue';
//import VideoCarousel from '@/components/video/VideoCarousel.vue';
//import Section from '@/components/ui/section/Section.vue';
import TrickDetailsContent from '@/components/stickable/trick/TrickDetailsContent.vue';
import { DbTricksTableZod } from '@/lib/database/schemas/Version1Schema';
//import { tricksDao, Trick } from '@/lib/database';
import Section from '@/components/ui/section/Section.vue';

//import messages from '../../i18n/tricks/trickDetails';
import ErrorInfo from '@/components/ErrorInfo.vue';

/*
const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;
*/

const route = useRoute();

//const id = ref<number>(0);
//const status = ref<"official" | "userDefined" | "archived">("userDefined");

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
        title="The provided trick status is invalid!"
        description='Check your URL. Only the values "official", "userDefined" and "archived" are allowed at the status position in "/tricks/<status>/<id>".'
      />
    </Section>
    <Section v-else-if="!id" class="w-full h-full flex flex-col items-center justify-center">
      <ErrorInfo
        :code="422"
        title="The provided trick id is invalid!"
        description='Check your URL. Only numbers are allowed at the id position in "/tricks/<status>/<id>".'
      />
    </Section>
    <TrickDetailsContent v-else class="w-full h-full" :status="status" :id="id" />
  </DefaultLayout>
</template>
