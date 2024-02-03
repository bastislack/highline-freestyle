<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';

import messages from '@/i18n/tricks/trickDetails';
import { tricksDao } from '@/lib/database';
import { Trick } from '@/lib/database/daos/trick';
import Badge from '@/components/ui/badge/Badge.vue';
import InfoElement from '@/components/stickable/InfoElement.vue';
import VideoCarousel from '@/components/video/VideoCarousel.vue';
import Section from '@/components/ui/section/Section.vue';
import Header from '@/components/stickable/Header.vue';
import ErrorInfo from '@/components/ErrorInfo.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Button from '@/components/ui/button/Button.vue';

const props = defineProps<{
  status: 'official' | 'userDefined' | 'archived';
  id: number;
}>();

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

const trick = ref<Trick | undefined>(undefined);
const recommendedPrerequisitesFull = ref<Trick[]>([]);
const variationOfFull = ref<Trick[]>([]);
const isTrickLoadingComplete = ref<boolean>(false);

async function getFullRecommendedPrerequisites(trick?: Trick): Promise<Trick[]> {
  if (
    trick === undefined ||
    trick.recommendedPrerequisites === undefined ||
    trick.recommendedPrerequisites.length == 0
  ) {
    return [];
  }
  return (
    await Promise.all(
      trick.recommendedPrerequisites.map(
        async (prerequisiteIdStatus): Promise<Trick | undefined> =>
          await tricksDao.getById(prerequisiteIdStatus[0], prerequisiteIdStatus[1])
      )
    )
  ).filter((item) => item !== undefined) as Trick[];
}

async function getVariationOfFull(trick?: Trick): Promise<Trick[]> {
  if (trick === undefined || trick.variationOf === undefined || trick.variationOf.length == 0) {
    return [];
  }
  return (
    await Promise.all(
      trick.variationOf.map(
        async (variationParent): Promise<Trick | undefined> =>
          await tricksDao.getById(variationParent[0], variationParent[1])
      )
    )
  ).filter((item) => item !== undefined) as Trick[];
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

const isTrickNew = computed(() => {
  if (trick.value === undefined || trick.value.dateAddedEpoch === undefined) {
    return false;
  }
  const IS_NEW_DAYS = 30;
  return daysSinceEpoch(trick.value.dateAddedEpoch) <= IS_NEW_DAYS;
});

watchEffect(async () => {
  isTrickLoadingComplete.value = false;

  trick.value = await tricksDao.getById(props.id, props.status);
  recommendedPrerequisitesFull.value = await getFullRecommendedPrerequisites(trick.value as Trick);
  variationOfFull.value = await getVariationOfFull(trick.value as Trick);

  isTrickLoadingComplete.value = true;
});
</script>

<template>
  <div v-if="isTrickLoadingComplete" class="h-full">
    <div v-if="!trick" class="h-full">
      <Section v-if="trick === undefined" class="h-full flex flex-col justify-center">
        <ErrorInfo
          :code="404"
          :title="t('error.trick-not-in-db.title')"
          :description="t('error.trick-not-in-db.description')"
        />
      </Section>
    </div>

    <div v-else>
      <Header>
        {{ trick.alias ? trick.alias : trick.technicalName }}

        <template #buttonRight>
          <Button size="icon" variant="ghost" disabled>
            <Icon icon="ic:round-edit" class="h-6 w-6 text-primary" />
          </Button>
        </template>
      </Header>
      <Section class="mt-1 lg:mt-0">
        <div class="flex flex-row justify-between gap-1 lg:gap-20">
          <div class="text-3xl mb-1">
            {{ trick.alias ? trick.alias : trick.technicalName }}
          </div>
          <div class="text-3xl text-primary flex flex-row gap-1 items-center">
            <div class="text-xs">{{ t('header.difficulty') }}</div>
            <div class="">
              {{ trick.difficultyLevel ? trick.difficultyLevel : '?' }}
            </div>
          </div>
        </div>
        <div v-if="trick.alias !== undefined" class="text-muted-foreground">
          {{ trick.technicalName }}
        </div>
        <div>
          {{ trick.startPosition + ' ' + t('header.to') + ' ' + trick.endPosition }}
        </div>

        <div class="flex flex-row gap-2">
          <Badge v-if="trick.primaryKey[1] == 'official'" variant="default" class="mt-2">
            <Icon icon="ic:round-check-circle" class="mr-1" />
            {{ t('badges.official') }}
          </Badge>
          <Badge v-if="trick.primaryKey[1] == 'archived'" variant="destructive" class="mt-2">
            <Icon icon="ic:baseline-archive" class="mr-1" />
            {{ t('badges.archived') }}
          </Badge>
          <Badge v-if="isTrickNew" variant="secondary" class="mt-2">
            <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
            {{ t('badges.new') }}
          </Badge>
        </div>
      </Section>

      <!-- Videos -->
      <Section
        v-if="trick.videos !== undefined && trick.videos.length >= 1"
        class="bg-secondary w-full"
      >
        <VideoCarousel :videos="trick.videos" />
      </Section>
      <Separator v-else />

      <!-- Other info-->
      <Section>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-y-6 gap-x-5">
          <InfoElement
            v-if="variationOfFull !== undefined && variationOfFull.length != 0"
            :title="t('info.variation-of.title')"
            icon="ic:twotone-fork-right"
          >
            <ul v-if="variationOfFull.length > 1" class="list-disc list-inside">
              <li
                v-for="variation in variationOfFull"
                :key="variation.primaryKey[1] + '-' + variation.primaryKey[0]"
                class="pb-1"
              >
                <RouterLink
                  :to="'/tricks/' + variation.primaryKey[1] + '/' + variation.primaryKey[0]"
                  class="underline"
                >
                  {{ variation.alias ? variation.alias : variation.technicalName }}
                </RouterLink>
              </li>
            </ul>
            <div v-else>
              <RouterLink
                :to="
                  '/tricks/' +
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
              </RouterLink>
            </div>
          </InfoElement>

          <InfoElement
            :title="t('info.description.title')"
            icon="ic:baseline-text-snippet"
            :is-info-missing="trick.description === undefined || trick.description.length == 0"
            :missing-message="t('info.description.missing-message')"
          >
            {{ trick.description }}
          </InfoElement>

          <div
            v-if="trick.establishedBy !== undefined || trick.yearEstablished !== undefined"
            class="grid gap-2"
            :class="
              trick.establishedBy !== undefined && trick.yearEstablished !== undefined
                ? 'grid-cols-2'
                : 'grid-cols-1'
            "
          >
            <InfoElement
              v-if="trick.establishedBy !== undefined"
              :title="t('info.invented-by.title')"
              icon="ic:baseline-person"
            >
              {{ trick.establishedBy }}
            </InfoElement>
            <InfoElement
              v-if="trick.yearEstablished !== undefined"
              :title="
                trick.establishedBy == undefined
                  ? t('info.invented-in.title-full')
                  : t('info.invented-in.title-in')
              "
              icon="ic:baseline-calendar-month"
            >
              {{ trick.yearEstablished }}
            </InfoElement>
          </div>

          <InfoElement
            :title="t('info.tips.title')"
            icon="ic:outline-lightbulb"
            :is-info-missing="trick.tips === undefined || trick.tips.length == 0"
            :missing-message="t('info.tips.missing-message')"
          >
            <ul class="list-disc list-inside">
              <li v-for="(tip, index) in trick.tips" :key="index" class="pb-1">
                {{ tip }}
              </li>
            </ul>
          </InfoElement>

          <InfoElement
            v-if="recommendedPrerequisitesFull.length > 0"
            :title="t('info.prerequisites.title')"
            icon="ic:round-undo"
          >
            <ul class="list-disc list-inside">
              <li
                v-for="(prerequisite, index) in recommendedPrerequisitesFull"
                :key="index"
                class="pb-1"
              >
                <RouterLink
                  :to="'/tricks/' + prerequisite.primaryKey[1] + '/' + prerequisite.primaryKey[0]"
                  class="underline"
                >
                  {{ prerequisite.alias ? prerequisite.alias : prerequisite.technicalName }}
                </RouterLink>
              </li>
            </ul>
          </InfoElement>
        </div>
      </Section>
    </div>
  </div>
</template>
