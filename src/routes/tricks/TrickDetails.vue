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

  let trick = await tricksDao.getById(idResult.data, statusResult.data);
  return trick;
}

async function getFullRecommendedPrerequisites(trick: Trick): Promise<Trick[]> {
  if (
    trick === undefined ||
    trick.recommendedPrerequisites === undefined ||
    trick.recommendedPrerequisites.length == 0
  ) {
    return [];
  }
  return await Promise.all(
    trick.recommendedPrerequisites.map(
      async (prerequisiteIdStatus): Promise<Trick> =>
        await tricksDao.getById(prerequisiteIdStatus[0], prerequisiteIdStatus[1])
    )
  );
}

let trick = ref<Trick>(undefined);
const recommendedPrerequisitesFull = ref<Trick[]>([]);

// Load content initially
onMounted(async () => {
  trick.value = await getTrick();
});

// Update content when URL changes
watch(route, async () => {
  trick.value = await getTrick();
});

watch(trick, async () => {
  recommendedPrerequisitesFull.value = await getFullRecommendedPrerequisites(trick.value);
});
</script>

<template>
  <DefaultLayout>
    <div v-if="trick !== undefined" class="w-full">
      <!-- Header -->
      <div class="p-3 md:p-5 lg:p-6 xl:px-12">
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
        <div class="p-3 md:p-5 lg:p-6 xl:px-12">
          <div v-for="video in trick.videos" v-bind:key="video.link">
            {{ video.link }}
          </div>
        </div>
        <Separator />
      </div>

      <!-- Other info-->
      <div class="p-3 md:p-5 lg:p-6 xl:px-12 grid grid-cols-1 lg:grid-cols-2 gap-y-6 gap-x-5">
        <InfoSection
          title="Description"
          icon="ic:baseline-text-snippet"
          :is-info-missing="trick.description === undefined || trick.description.length == 0"
          missing-message="Description missing"
          has-separator-on-bottom
        >
          {{ trick.description }}
        </InfoSection>

        <InfoSection
          title="Tips"
          icon="ic:outline-lightbulb"
          :is-info-missing="trick.tips === undefined || trick.tips.length == 0"
          missing-message="No tips for you!"
          has-separator-on-bottom
        >
          <ul class="list-disc list-inside">
            <li v-for="(tip, index) in trick.tips" :key="index" class="pb-1">
              {{ tip }}
            </li>
          </ul>
        </InfoSection>

        <InfoSection
          v-if="recommendedPrerequisitesFull.length > 0"
          title="Prerequisites"
          icon="ic:round-undo"
          has-separator-on-bottom
        >
          <!-- Continue here -->
          <ul class="list-disc list-inside">
            <li
              v-for="(prerequisite, index) in recommendedPrerequisitesFull"
              :key="index"
              class="pb-1"
            >
              <a
                :href="'#/tricks/' + prerequisite.primaryKey[1] + '/' + prerequisite.primaryKey[0]"
                class="underline"
              >
                {{ prerequisite.alias ? prerequisite.alias : prerequisite.technicalName }}
              </a>
            </li>
          </ul>
        </InfoSection>

        <div class="grid grid-cols-2 gap-2">
          <InfoSection
            title="Invented by"
            icon="ic:baseline-person"
            :is-info-missing="trick.establishedBy === undefined"
            missing-message="Unknown"
            has-separator-on-bottom
          >
            {{ trick.establishedBy }}
          </InfoSection>
          <InfoSection
            title="in the year"
            icon="ic:baseline-calendar-month"
            :is-info-missing="trick.yearEstablished === undefined"
            missing-message="Unknown"
            has-separator-on-bottom
          >
            <!-- TODO: This seems incorrect. -->
            {{ trick.yearEstablished }}
          </InfoSection>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
