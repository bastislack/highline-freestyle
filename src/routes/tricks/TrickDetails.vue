<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { z } from 'zod';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import Separator from '@/components/ui/separator/Separator.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import InfoSection from '@/components/InfoSection.vue';
import { DbTricksTableZod } from '@/lib/database/schemas/Version1Schema';
import { tricksDao, Trick } from '@/lib/database';

import messages from '../../i18n/tricks/trickDetails';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;
const route = useRoute();

function parseAndValidateId(): z.SafeParseReturnType<number, number> {
  const idRaw = Number(route.params.id);
  const idResult = DbTricksTableZod._def.shape().id.safeParse(idRaw);
  return idResult;
}

function parseAndValidateStatus(): z.SafeParseReturnType<
  'official' | 'userDefined' | 'archived',
  'official' | 'userDefined' | 'archived'
> {
  const statusRaw = route.params.status;
  const statusResult = DbTricksTableZod._def.shape().trickStatus.safeParse(statusRaw);
  //let status: DbTricks["trickStatus"] = "official";
  return statusResult;
}

async function getTrick(): Promise<Trick> {
  const idResult: z.SafeParseReturnType<number, number> = parseAndValidateId();
  if (!idResult.success) {
    return undefined;
  }

  const statusResult = parseAndValidateStatus();
  if (!statusResult.success) {
    return undefined;
  }

  return await tricksDao.getById(idResult.data, statusResult.data);
}

let trick = ref<Trick>(undefined);

// Load content initially
onMounted(async () => {
  trick.value = await getTrick();
});

// Update content when URL changes
watch(route, async () => {
  trick.value = await getTrick();
});
</script>

<template>
  <DefaultLayout>
    <div v-if="trick !== undefined" class="w-full">
      <!-- Header -->
      <div class="p-3 lg:p-6">
        <div class="text-2xl">
          {{ trick.alias ? trick.alias : trick.technicalName }}
        </div>
        <div>
          {{ trick.startPosition + ' ' + t('to') + ' ' + trick.endPosition }}
        </div>
        <div v-if="trick.alias !== undefined" class="text-muted-foreground">
          {{ trick.technicalName }}
        </div>
      </div>
      <Separator />

      <!-- Videos -->
      <div
        v-if="trick.videos !== undefined && trick.videos.length >= 1"
        class="bg-secondary w-full"
      >
        <div class="p-3 lg:p-6">
          <div v-for="video in trick.videos" v-bind:key="video.link">
            {{ video.link }}
          </div>
        </div>
        <Separator />
      </div>

      <!-- Other info-->
      <div class="p-3 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-5">
        <InfoSection title="Description" icon="ic:baseline-text-snippet">
          {{ trick.description }}
        </InfoSection>

        <div class="grid grid-cols-2 gap-2">
          <InfoSection
            title="Invented by"
            icon="ic:baseline-person"
            :is-info-missing="trick.establishedBy === undefined"
            missing-message="Unknown"
          >
            {{ trick.establishedBy }}
          </InfoSection>
          <InfoSection
            title="in"
            icon="ic:baseline-calendar-month"
            :is-info-missing="trick.yearEstablished === undefined"
            missing-message="Unknown"
          >
            <!-- TODO: This seems incorrect. -->
            {{ trick.yearEstablished }}
          </InfoSection>
        </div>

        <InfoSection
          title="Tips"
          icon="ic:outline-lightbulb"
          :is-info-missing="trick.tips === undefined || trick.tips.length == 0"
          missing-message="No tips for you!"
        >
          <ul class="list-disc list-inside">
            <li v-for="(tip, index) in trick.tips" :key="index" class="pb-1">
              {{ tip }}
            </li>
          </ul>
        </InfoSection>

        <InfoSection title="Prerequisites" icon="ic:round-undo"> </InfoSection>
      </div>
    </div>
  </DefaultLayout>
</template>
