<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { z } from 'zod';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

import Separator from '@/components/ui/separator/Separator.vue';
import Badge from '@/components/ui/badge/Badge.vue';
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

async function getVariationOfFull(trick: Trick): Promise<Trick[]> {
  if (trick === undefined || trick.variationOf === undefined || trick.variationOf.length == 0) {
    return [];
  }
  return await Promise.all(
    trick.variationOf.map(
      async (variationParent): Promise<Trick> =>
        await tricksDao.getById(variationParent[0], variationParent[1])
    )
  );
}

/**
 * I am not certain if this function is super accurate or how leap years
 * and time zones are handled. But nothing hinges on this function being
 * super accurate so it is fine this way, being about right, give or take
 * about a day.
 */
function daysSinceEpoch(epoch: number): number {
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  const today = new Date();
  const date = new Date(epoch * 1000);

  const timeDiff = today.getTime() - date.getTime();
  const daysDiff = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);

  return daysDiff;
}

function isTrickNew(trick_: Trick): boolean {
  if (trick_ === undefined || trick_.dateAddedEpoch === undefined) {
    return false;
  }

  const IS_NEW_DAYS = 30;
  return daysSinceEpoch(trick_.dateAddedEpoch) <= IS_NEW_DAYS;
}

const trick = ref<Trick>(undefined);
const recommendedPrerequisitesFull = ref<Trick[]>([]);
const variationOfFull = ref<Trick[]>([]);
const trickLoadingComplete = ref<boolean>(false);

// Load content initially
onMounted(async () => {
  trickLoadingComplete.value = false;
  trick.value = await getTrick();
  trickLoadingComplete.value = true;
});

// Update content when URL changes
watch(route, async () => {
  trickLoadingComplete.value = false;
  trick.value = await getTrick();
  trickLoadingComplete.value = true;
});

watch(trick, async () => {
  recommendedPrerequisitesFull.value = await getFullRecommendedPrerequisites(trick.value);
  variationOfFull.value = await getVariationOfFull(trick.value);
});
</script>

<template>
  <DefaultLayout>
    <!-- Finished loading -->
    <div v-if="trickLoadingComplete" class="w-full">
      <!-- Trick does not exist -->
      <div v-if="trick === undefined" class="grid justify-items-center pt-36 p-10">
        <div class="text-2xl">Something went wrong!</div>
        <div class="mb-5 text-muted-foreground">Paul the problem parrot appears:</div>
        <div
          class="flex flex-row text-destructive align-center border border-border p-3 rounded-xl"
        >
          <Icon
            icon="fluent-emoji-high-contrast:parrot"
            class="h-16 w-16 md:h-20 md:w-20 text-destructive mr-2 flex-none"
          />
          <div class="align-middle">
            "What are you doing, silly human? This trick does not exist on your device. Chrip."
          </div>
        </div>
      </div>

      <!-- Standard trick page -->
      <div v-else>
        <!-- Header -->
        <div class="p-3 md:p-5 lg:p-6 xl:px-12">
          <div class="flex flex-row justify-between gap-1 lg:justify-start lg:gap-20">
            <div class="text-3xl mb-1">
              {{ trick.alias ? trick.alias : trick.technicalName }}
            </div>
            <div class="text-3xl text-primary flex flex-row gap-1 flex-none">
              <div class="text-xs self-baseline">Difficulty</div>
              <div class="self-baseline">
                {{ trick.difficultyLevel ? trick.difficultyLevel : '?' }}
              </div>
            </div>
          </div>
          <div v-if="trick.alias !== undefined" class="text-muted-foreground">
            {{ trick.technicalName }}
          </div>
          <div>
            {{ trick.startPosition + ' ' + t('to') + ' ' + trick.endPosition }}
          </div>

          <div class="flex flex-row gap-2">
            <Badge v-if="trick.primaryKey[1] == 'official'" variant="default" class="mt-2">
              <Icon icon="ic:round-check-circle" class="mr-1" /> Official
            </Badge>
            <Badge v-if="trick.primaryKey[1] == 'archived'" variant="destructive" class="mt-2">
              <Icon icon="ic:baseline-archive" class="mr-1" /> Archived
            </Badge>
            <Badge v-if="isTrickNew(trick)" variant="secondary" class="mt-2">
              <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
              New
            </Badge>
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
        </div>

        <Separator />

        <!-- Other info-->
        <div class="p-3 md:p-5 lg:p-6 xl:px-12 grid grid-cols-1 lg:grid-cols-2 gap-y-6 gap-x-5">
          <InfoSection
            v-if="variationOfFull !== undefined && variationOfFull.length != 0"
            title="Variation of"
            icon="ic:twotone-fork-right"
          >
            <ul v-if="variationOfFull.length > 1" class="list-disc list-inside">
              <li
                v-for="variation in variationOfFull"
                :key="variation.primaryKey[1] + '-' + variation.primaryKey[0]"
                class="pb-1"
              >
                <a
                  :href="'#/tricks/' + variation.primaryKey[1] + '/' + variation.primaryKey[0]"
                  class="underline"
                >
                  {{ variation.alias ? variation.alias : variation.technicalName }}
                </a>
              </li>
            </ul>
            <div v-else>
              <a
                :href="
                  '#/tricks/' +
                  variationOfFull[0].primaryKey[1] +
                  '/' +
                  variationOfFull[0].primaryKey[0]
                "
                class="underline"
              >
                {{
                  variationOfFull[0].alias
                    ? variationOfFull[0].alias
                    : variationOfFull[0].technicalName
                }}
              </a>
            </div>
          </InfoSection>

          <InfoSection
            title="Description"
            icon="ic:baseline-text-snippet"
            :is-info-missing="trick.description === undefined || trick.description.length == 0"
            missing-message="Description missing"
          >
            {{ trick.description }}
          </InfoSection>

          <div
            v-if="trick.establishedBy !== undefined || trick.yearEstablished !== undefined"
            class="grid gap-2"
            :class="
              trick.establishedBy !== undefined && trick.yearEstablished !== undefined
                ? 'grid-cols-2'
                : 'grid-cols-1'
            "
          >
            <InfoSection
              v-if="trick.establishedBy !== undefined"
              title="Invented by"
              icon="ic:baseline-person"
            >
              {{ trick.establishedBy }}
            </InfoSection>
            <InfoSection
              v-if="trick.yearEstablished !== undefined"
              :title="trick.establishedBy == undefined ? 'Invented in' : 'in'"
              icon="ic:baseline-calendar-month"
            >
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

          <InfoSection
            v-if="recommendedPrerequisitesFull.length > 0"
            title="Prerequisites"
            icon="ic:round-undo"
          >
            <!-- Continue here -->
            <ul class="list-disc list-inside">
              <li
                v-for="(prerequisite, index) in recommendedPrerequisitesFull"
                :key="index"
                class="pb-1"
              >
                <a
                  :href="
                    '#/tricks/' + prerequisite.primaryKey[1] + '/' + prerequisite.primaryKey[0]
                  "
                  class="underline"
                >
                  {{ prerequisite.alias ? prerequisite.alias : prerequisite.technicalName }}
                </a>
              </li>
            </ul>
          </InfoSection>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
