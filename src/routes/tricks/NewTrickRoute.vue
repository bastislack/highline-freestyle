<script lang="ts" setup>
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import TextInput from '../../components/ui/customForm/TextInput.vue';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import buildIntegerFormValidator from '@/lib/formValidators/integerFormValidator';
import stringFormValidator from '@/lib/formValidators/stringFormValidator';
import { Button } from '@/components/ui/button';

import Section from '@/components/ui/section/Section.vue';

import { useI18n } from 'vue-i18n';
import messages from '@/i18n/tricks/new/index';
import messages_positions from '@/i18n/common/positions';
import messages_errors from '@/i18n/error.ts';
import { i18nMerge } from '@/i18n/i18nmerge';
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import PositionSelectInput from '@/components/ui/customForm/PositionSelectInput.vue';
import buildPositionFormValidator from '@/lib/formValidators/positionFormValidator';
import MultilineTextInput from '@/components/ui/customForm/MultilineTextInput.vue';
import TrickSelect from '@/components/ui/customForm/TrickSelect.vue';
import { CreateNewTrickType } from '@/lib/database/daos/tricksDao';
import databaseInstance from '@/lib/database/databaseInstance';
import { ToastAction, useToast } from '@/components/ui/toast';
import { useRouter } from 'vue-router';
import { h } from 'vue';

const toast = useToast();
const router = useRouter();

const { t } = useI18n({
  messages: i18nMerge(messages, messages_errors, messages_positions),
  scope: 'local',
});

function preprocessZodNumberType(x: unknown) {
  if (typeof x !== 'string') {
    return x;
  }
  if (x.trim().length === 0) {
    return undefined;
  }
  return Number(x.trim());
}

function preprocessZodStringType(x: unknown) {
  if (typeof x !== 'string') {
    return x;
  }
  if (x.trim().length === 0) {
    return undefined;
  }
  return x.trim();
}

/**
 * This is not used for the actual validation, but for the "post-validation" step where form strings may get coerced into Numbers, etc.
 */
const formSchemaZod = z.object({
  technicalName: z.preprocess(preprocessZodStringType, z.string().min(1)),
  alias: z.preprocess(preprocessZodStringType, z.string().optional()),
  establishedBy: z.preprocess(preprocessZodStringType, z.string().optional()),
  difficulty: z.preprocess(preprocessZodNumberType, z.number().int().min(1).max(10).optional()),
  startPosition: DbPositionZod,
  endPosition: DbPositionZod,
  description: z.preprocess(preprocessZodStringType, z.string().optional()),
  tips: z.preprocess((val) => {
    const response = preprocessZodStringType(val);
    if (typeof response !== 'string') {
      return response;
    }
    return response.split('\n').filter((e) => e.trim().length > 0);
  }, z.array(z.string()).optional()),
  yearEstablished: z.preprocess(preprocessZodNumberType, z.number().int().min(1900).optional()),
  // variantOf: z.unknown().optional(), // will be added later
  // recommendedPrerequisites: z.unknown().optional(), // will be added later,
  // videos: z.array(DbVideoZod).optional(),
});

const form = useForm({
  validateOnMount: true,
  initialValues: {
    startPosition: DbPositionZod.Values.Buddha,
    endPosition: DbPositionZod.Values['Double Drop Knee'],
  },
});

const submit = form.handleSubmit(async (vals) => {
  const validatedVals = formSchemaZod.parse(vals);

  const trick: CreateNewTrickType = {
    technicalName: validatedVals.technicalName,
    alias: validatedVals.alias,
    dateAddedEpoch: new Date().getTime(),
    establishedBy: validatedVals.establishedBy,
    difficultyLevel: validatedVals.difficulty,
    startPosition: validatedVals.startPosition,
    endPosition: validatedVals.endPosition,
    description: validatedVals.description,
    tips: validatedVals.tips,
    yearEstablished: validatedVals.yearEstablished,
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

    console.log(result);

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

  console.log('Submit: ', validatedVals);
});

function hasHistory(): boolean {
  return window.history.length > 2;
}
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-2xl md:text-3xl my-4 font-black">{{ t('titleHeading') }}</h1>

      <form
        class="grid gap-4 lg:gap-6 grid-cols-4"
        :validation-schema="formSchemaZod"
        @submit="submit"
      >
        <TextInput
          :title="t('label.technicalName')"
          :placeholder="t('placeholder.technicalName')"
          form-field-name="technicalName"
          class="col-span-4 md:col-span-2"
          :validator="stringFormValidator({ required: true }, t)"
        />
        <TextInput
          :title="t('label.alias')"
          :description="t('question.alias')"
          :placeholder="t('placeholder.alias')"
          form-field-name="alias"
          class="col-span-4 md:col-span-2"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <PositionSelectInput
          class="col-span-2 md:col-span-1"
          :title="t('label.positionStart')"
          form-field-name="startPosition"
          :validator="buildPositionFormValidator({ required: true }, t)"
        />

        <PositionSelectInput
          class="col-span-2 md:col-span-1"
          :title="t('label.positionEnd')"
          form-field-name="endPosition"
          :validator="buildPositionFormValidator({ required: true }, t)"
        />

        <TextInput
          class="col-span-4 md:col-span-2"
          :title="t('label.difficulty')"
          :description="t('question.difficulty')"
          :placeholder="t('placeholder.difficulty')"
          form-field-name="difficulty"
          :validator="
            buildIntegerFormValidator(
              {
                minInclusive: 1,
                maxInclusive: 10,
                required: false,
              },
              t
            )
          "
        />

        <MultilineTextInput
          input-class="h-16"
          class="col-span-4"
          :title="t('label.description')"
          :placeholder="t('placeholder.description')"
          form-field-name="description"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <TextInput
          :title="t('label.establishedBy')"
          :placeholder="t('placeholder.establishedBy')"
          form-field-name="establishedBy"
          class="col-span-4 md:col-span-2"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <TextInput
          class="col-span-4 md:col-span-2"
          :title="t('label.inTheYear')"
          placeholder="2024"
          form-field-name="yearEstablished"
          :validator="
            buildIntegerFormValidator(
              {
                minInclusive: 1900,
                maxInclusive: new Date().getUTCFullYear(),
                required: false,
              },
              t
            )
          "
        />

        <MultilineTextInput
          input-class="h-16"
          class="col-span-4"
          :title="t('label.tips')"
          :description="t('question.tips')"
          :placeholder="t('placeholder.tips')"
          form-field-name="tips"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <TrickSelect
          input-class="h-16"
          class="col-span-4 md:col-span-2"
          :title="t('label.variantOf')"
          :description="t('question.variantOf')"
          form-field-name="variantOf"
          :validator="stringFormValidator({ required: false }, t)"
        />
        <TrickSelect
          input-class="h-16"
          class="col-span-4 md:col-span-2"
          :title="t('label.recommendedPrereq')"
          :description="t('question.recommendedPrereq')"
          form-field-name="recommendedPrerequisites"
          :validator="stringFormValidator({ required: false }, t)"
        />
        <TrickSelect
          input-class="h-16"
          class="col-span-4"
          :title="t('label.videos')"
          form-field-name="videos"
          :validator="stringFormValidator({ required: false }, t)"
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
