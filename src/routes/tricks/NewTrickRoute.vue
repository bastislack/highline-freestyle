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
  if (vals.suggestAsOfficial) {
    try {
      await submitOfficialSuggestion(vals);
      toast.toast({
        title: t('toast.suggestedTrick', { name: vals.technicalName }),
        description: t('toast.suggestedTrickDescription'),
        duration: 6000,
      });
      if (showBack.value) goBack();
      else goHome();
    } catch (err) {
      console.error(err);
      const description =
        err instanceof UnsupportedPositionError
          ? t('error.unsupportedPosition', { position: err.position })
          : t('error.suggestionMessage');
      toast.toast({
        title: t('error.title'),
        description,
        class: 'bg-destructive-700 text-white',
        duration: 5000,
      });
    }
    return;
  }

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
  try {
    const result = await databaseInstance.tricksDao.createNew(trick, 'userDefined');

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
    router.replace('/tricks/' + result.primaryKey[1] + '/' + result.primaryKey[0]);
  } catch (err) {
    console.error(err);
    toast.toast({
      title: t('error.title'),
      description: t('error.message'),
      class: 'bg-destructive-700 text-white',
      duration: 5000,
    });
  }
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
