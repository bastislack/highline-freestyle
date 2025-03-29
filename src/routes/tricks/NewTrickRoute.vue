<script lang="ts" setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import { h } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';

import messages from '@/i18n/tricks/new/index';
import messagesPositions from '@/i18n/common/positions';
import { i18nMerge } from '@/i18n/i18nmerge';
import { DbPositionZod, DbReferenceZod } from '@/lib/database/schemas/CurrentVersionSchema';
import { CreateNewTrickType } from '@/lib/database/daos/tricksDao';
import databaseInstance from '@/lib/database/databaseInstance';

import { Button } from '@/components/ui/button';
import Section from '@/components/ui/section/Section.vue';
import PositionSelectInput from '@/components/ui/customForm/PositionSelectInput.vue';
import MultilineTextInput from '@/components/ui/customForm/MultilineTextInput.vue';
import TrickSelect from '@/components/ui/customForm/TrickSelect.vue';
import { ToastAction, useToast } from '@/components/ui/toast';
import TextInput from '@/components/ui/customForm/TextInput.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/vue/dist/iconify.js';
import MultiTrickSelect from '@/components/ui/customForm/MultiTrickSelect.vue';

const toast = useToast();
const router = useRouter();

const { t } = useI18n({
  messages: i18nMerge(messages, messagesPositions),
  scope: 'local',
});

const newTrickSchema = z.object({
  technicalName: z.string().trim().min(1),
  alias: z.string().optional(),
  establishedBy: z.string().optional(),
  difficulty: z.union([
    z
      .number()
      .int({ message: 'INPUT_NOT_INTEGER' })
      .min(1, { message: 'INPUT_NUMBER_BELOW_MIN' })
      .max(20, { message: 'INPUT_NUMBER_ABOVE_MAX' }),
    z.literal(''), // When input with type="numeric" is empty it sends an empty string, this works as the `.optional()`
  ]),
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
  yearEstablished: z.union([
    z
      .number()
      .int({ message: 'INPUT_NOT_INTEGER' })
      .min(1900, { message: 'INPUT_NUMBER_BELOW_MIN' })
      .max(new Date().getFullYear(), { message: 'INPUT_NUMBER_ABOVE_MAX' })
      .optional(),
    z.literal(''), // When input with type="numeric" is empty it sends an empty string, this works as the `.optional()`
  ]),
  variationOf: z.array(DbReferenceZod).optional(),
  recommendedPrerequisites: z.array(DbReferenceZod).optional(), // will be added later,
  // videos: z.array(DbVideoZod).optional(),
});
export type NewTrickSchema = z.infer<typeof newTrickSchema>;
const validationSchema = toTypedSchema(newTrickSchema);

const form = useForm<NewTrickSchema>({
  validationSchema: validationSchema,
  initialValues: {
    startPosition: DbPositionZod.Values.Buddha,
    endPosition: DbPositionZod.Values['Double Drop Knee'],
    difficulty: '',
    variationOf: [],
    recommendedPrerequisites: [],
  },
});

const submit = form.handleSubmit(async (vals) => {
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
    <Suspense>
      <Section>
        <h1 class="text-2xl md:text-3xl mb-3 mt-2">{{ t('titleHeading') }}</h1>

        <Alert variant="default" class="my-3">
          <Icon icon="ic:outline-info" class="w-5 h-5" />
          <AlertTitle class="pl-3">{{ t('personalTrickInfo.title') }}</AlertTitle>
          <AlertDescription class="pl-3">{{ t('personalTrickInfo.description') }}</AlertDescription>
        </Alert>

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
            inputMode="numeric"
            type="number"
            :error-values="{ min: '1', max: '20' }"
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
            inputMode="numeric"
            type="number"
            :error-values="{ min: '1900', max: new Date().getFullYear().toString() }"
          />

          <MultilineTextInput
            input-class="h-16"
            class="col-span-4"
            :title="t('label.tips')"
            :description="t('question.tips')"
            :placeholder="t('placeholder.tips')"
            form-field-name="tips"
          />

          <MultiTrickSelect
            input-class="h-16"
            class="col-span-4 md:col-span-2"
            :title="t('label.variantOf')"
            :description="t('question.variantOf')"
            form-field-name="variationOf"
          />

          <MultiTrickSelect
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
    </Suspense>
  </DefaultLayout>
</template>
