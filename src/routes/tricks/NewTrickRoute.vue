<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { h } from 'vue';

import messages from '@/i18n/tricks/new/index';
import databaseInstance from '@/lib/database/databaseInstance';

import Header from '@/components/stickable/Header.vue';
import { useHistoryNav } from '@/composables/useHistoryNav';
import Section from '@/components/ui/section/Section.vue';
import { ToastAction, useToast } from '@/components/ui/toast';
import TrickForm from '@/components/stickable/trick/TrickForm.vue';
import type { TrickFormSchema } from '@/components/stickable/trick/TrickForm.vue';
import { CreateNewTrickType } from '@/lib/database/daos/tricksDao';
import { submitOfficialSuggestion, UnsupportedPositionError } from '@/lib/officialTrickSuggestion';

const toast = useToast();
const router = useRouter();
const { showBack, goBack, goHome } = useHistoryNav('/tricks');

function cancel() {
  if (showBack.value) goBack();
  else goHome();
}

const { t } = useI18n({ messages, useScope: 'local' });

async function onSubmit(vals: TrickFormSchema) {
  const trick: CreateNewTrickType = {
    technicalName: vals.technicalName,
    alias: vals.alias,
    dateAddedEpoch: new Date().getTime(),
    establishedBy: vals.establishedBy,
    difficultyLevel: vals.difficulty === '' ? undefined : vals.difficulty,
    startPosition: vals.startPosition,
    endPosition: vals.endPosition,
    description: vals.description,
    tips: vals.tips,
    yearEstablished: vals.yearEstablished === '' ? undefined : vals.yearEstablished,
    recommendedPrerequisites: vals.recommendedPrerequisites,
    variationOf: vals.variationOf,
    showInSearchQueries: true,
    videos: vals.videos,
    isFavorite: false,
    notes: undefined,
    stickFrequency: undefined,
  };

  let result;
  try {
    result = await databaseInstance.tricksDao.createNew(trick, 'userDefined');
  } catch (err) {
    console.error(err);
    toast.toast({
      title: t('error.title'),
      description: t('error.message'),
      class: 'bg-destructive-700 text-white',
      duration: 5000,
    });
    return;
  }

  const goToTrick = () =>
    router.replace('/tricks/' + result.primaryKey[1] + '/' + result.primaryKey[0]);

  // The personal trick is always created. When the toggle is on, also send
  // the suggestion to the maintainers. A failed suggestion must not lose the
  // already-created personal trick.
  if (vals.suggestAsOfficial) {
    try {
      await submitOfficialSuggestion(vals);
      toast.toast({
        title: t('toast.createdAndSuggested', { name: result.technicalName }),
        description: t('toast.createdAndSuggestedDescription'),
        duration: 6000,
      });
    } catch (err) {
      console.error(err);
      const description =
        err instanceof UnsupportedPositionError
          ? t('error.unsupportedPosition', { position: err.position })
          : t('error.suggestionMessage');
      toast.toast({
        title: t('error.suggestionFailedTitle'),
        description,
        class: 'bg-destructive-700 text-white',
        duration: 6000,
      });
    }
    goToTrick();
    return;
  }

  toast.toast({
    title: t('toast.createdTrick', { name: result.technicalName }),
    action: h(
      ToastAction,
      {
        altText: t('toast.addAnotherTrick'),
        onClick: () => {
          router.push('/tricks/new');
        },
      },
      { default: () => t('toast.addAnotherTrick') }
    ),
    duration: 5000,
  });
  goToTrick();
}
</script>

<template>
  <DefaultLayout>
    <Header>{{ t('headerTitle') }}</Header>
    <Suspense>
      <Section>
        <h1 class="text-2xl md:text-3xl mb-3 mt-2">{{ t('titleHeading') }}</h1>

        <TrickForm
          :submit-label="t('buttonSubmit')"
          :submit-label-suggested="t('buttonSubmitSuggestion')"
          @submit="onSubmit"
          @cancel="cancel"
        />
      </Section>
    </Suspense>
  </DefaultLayout>
</template>
