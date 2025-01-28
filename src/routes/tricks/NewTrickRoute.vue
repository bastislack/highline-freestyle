<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import { h } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';

import messages from '@/i18n/tricks/new/index';
import messages_positions from '@/i18n/common/positions';
import { i18nMerge } from '@/i18n/i18nmerge';
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import { CreateNewTrickType } from '@/lib/database/daos/tricksDao';
import databaseInstance from '@/lib/database/databaseInstance';

import { Button } from '@/components/ui/button';
import Section from '@/components/ui/section/Section.vue';
import PositionSelectInput from '@/components/ui/customForm/PositionSelectInput.vue';
import MultilineTextInput from '@/components/ui/customForm/MultilineTextInput.vue';
import TrickSelect from '@/components/ui/customForm/TrickSelect.vue';
import { ToastAction, useToast } from '@/components/ui/toast';
import TextInput from '@/components/ui/customForm/TextInput.vue';

const toast = useToast();
const router = useRouter();

const { t } = useI18n({
  messages: i18nMerge(messages, messages_positions),
  scope: 'local',
});

const newTrickSchema = z.object({
  technicalName: z.string().trim().min(1),
  alias: z.string().optional(),
  establishedBy: z.string().optional(),
  difficulty: z
    .number()
    .int({ message: 'INPUT_NOT_INTEGER' })
    .min(1, { message: 'INPUT_NUMBER_BELOW_MIN' })
    .max(10, { message: 'INPUT_NUMBER_ABOVE_MAX' })
    .optional(),
  startPosition: DbPositionZod,
  endPosition: DbPositionZod,
  description: z.string().optional(),
  tips: z
    .preprocess(
      (val) => {
        if (typeof val === 'string') {
          // Split by newlines, trim each line, and filter out empty strings
          return val
            .split('\n')
            .map((t) => t.trim())
            .filter((t) => t !== '');
        }
        return val;
      },
      z.array(z.string().min(1)).optional()
    )
    .optional(),
  yearEstablished: z
    .number()
    .int({ message: 'INPUT_NOT_INTEGER' })
    .min(1900, { message: 'INPUT_NUMBER_BELOW_MIN' })
    .optional(),
  // variantOf: z.unknown().optional(), // will be added later
  // recommendedPrerequisites: z.unknown().optional(), // will be added later,
  // videos: z.array(DbVideoZod).optional(),
});
export type NewTrickSchema = z.infer<typeof newTrickSchema>;
const validationSchema = toTypedSchema(newTrickSchema);

const form = useForm({
  validationSchema: validationSchema,
  initialValues: {
    startPosition: DbPositionZod.Values.Buddha,
    endPosition: DbPositionZod.Values['Double Drop Knee'],
  },
});

const submit = form.handleSubmit(async (vals) => {
  const trick: CreateNewTrickType = {
    technicalName: vals.technicalName,
    alias: vals.alias,
    dateAddedEpoch: new Date().getTime(),
    establishedBy: vals.establishedBy,
    difficultyLevel: vals.difficulty,
    startPosition: vals.startPosition,
    endPosition: vals.endPosition,
    description: vals.description,
    tips: vals.tips,
    yearEstablished: vals.yearEstablished,
    recommendedPrerequisites: [],
    variationOf: [],
    showInSearchQueries: true,
    videos: [],
    isFavourite: false,
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
    router.push('/tricks/' + result.primaryKey[1] + '/' + result.primaryKey[0]);
  } catch (err) {
    console.error(err);
    toast.toast({
      title: t('error.title'),
      description: t('error.message'),
      class: 'bg-destructive-700 text-white',
      duration: 5000,
    });
  }
});

function hasHistory(): boolean {
  return window.history.length > 2;
}
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-2xl md:text-3xl my-4 font-black">{{ t('titleHeading') }}</h1>

      <form class="grid gap-4 lg:gap-6 grid-cols-4" @submit="submit">
        <TextInput
          :title="t('label.technicalName')"
          :placeholder="t('placeholder.technicalName')"
          form-field-name="technicalName"
          class="col-span-4 md:col-span-2"
        />
        <TextInput
          :title="t('label.alias')"
          :description="t('question.alias')"
          :placeholder="t('placeholder.alias')"
          form-field-name="alias"
          class="col-span-4 md:col-span-2"
        />

        <PositionSelectInput
          class="col-span-2 md:col-span-1"
          :title="t('label.positionStart')"
          form-field-name="startPosition"
        />

        <PositionSelectInput
          class="col-span-2 md:col-span-1"
          :title="t('label.positionEnd')"
          form-field-name="endPosition"
        />

        <TextInput
          class="col-span-4 md:col-span-2"
          :title="t('label.difficulty')"
          :description="t('question.difficulty')"
          :placeholder="t('placeholder.difficulty')"
          form-field-name="difficulty"
        />

        <MultilineTextInput
          input-class="h-16"
          class="col-span-4"
          :title="t('label.description')"
          :placeholder="t('placeholder.description')"
          form-field-name="description"
        />

        <TextInput
          :title="t('label.establishedBy')"
          :placeholder="t('placeholder.establishedBy')"
          form-field-name="establishedBy"
          class="col-span-4 md:col-span-2"
        />

        <TextInput
          class="col-span-4 md:col-span-2"
          :title="t('label.inTheYear')"
          placeholder="2024"
          form-field-name="yearEstablished"
        />

        <MultilineTextInput
          input-class="h-16"
          class="col-span-4"
          :title="t('label.tips')"
          :description="t('question.tips')"
          :placeholder="t('placeholder.tips')"
          form-field-name="tips"
        />

        <TrickSelect
          input-class="h-16"
          class="col-span-4 md:col-span-2"
          :title="t('label.variantOf')"
          :description="t('question.variantOf')"
          form-field-name="variantOf"
        />
        <TrickSelect
          input-class="h-16"
          class="col-span-4 md:col-span-2"
          :title="t('label.recommendedPrereq')"
          :description="t('question.recommendedPrereq')"
          form-field-name="recommendedPrerequisites"
        />
        <TrickSelect
          input-class="h-16"
          class="col-span-4"
          :title="t('label.videos')"
          form-field-name="videos"
        />

        <div class="col-span-4 gap-2 inline-flex justify-end">
          <Button variant="ghost" @click="hasHistory() ? $router.back() : $router.push('/')">
            {{ t('buttonCancel') }}
          </Button>
          <Button type="submit"> {{ t('buttonSubmit') }} </Button>
        </div>
      </form>
    </Section>
  </DefaultLayout>
</template>
