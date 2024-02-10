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
      title: `Created trick ${result.technicalName}`,
      action: h(
        ToastAction,
        {
          altText: t('TOAST_ADD_ANOTHER_TRICK'),
          onClick: () => {
            router.push('/tricks/new');
          },
        },
        { default: () => t('TOAST_ADD_ANOTHER_TRICK') }
      ),
      duration: 5000,
    });
    router.push('/tricks/' + result.primaryKey[1] + '/' + result.primaryKey[0]);
  } catch (err) {
    console.error(err);
    toast.toast({
      title: t('ERR_TOAST_TITLE'),
      description: t('ERR_TOAST_MESSAGE'),
      class: 'bg-destructive-700 text-white',
      duration: 5000,
    });
  }

  console.log('Submit: ', validatedVals);
});
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-3xl my-4 font-black">{{ t('TITLE_HEADING') }}</h1>

      <form class="grid gap-6 grid-cols-2" :validation-schema="formSchemaZod" @submit="submit">
        <TextInput
          :title="t('LABEL_TECHNICAL_NAME')"
          :description="t('QUESTION_TECHNICAL_NAME')"
          :placeholder="t('PLACEHOLDER_TECHNICAL_NAME')"
          form-field-name="technicalName"
          class="col-span-2 md:col-span-1"
          :validator="stringFormValidator({ required: true }, t)"
        />
        <TextInput
          :title="t('LABEL_ALIAS_NAME')"
          :description="t('QUESTION_ALIAS_NAME')"
          :placeholder="t('PLACEHOLDER_ALIAS_NAME')"
          form-field-name="alias"
          class="col-span-2 md:col-span-1"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <TextInput
          :title="t('LABEL_ESTABLISHED_BY')"
          :description="t('QUESTION_ESTABLISHED_BY')"
          :placeholder="t('PLACEHOLDER_ESTABLISHED_BY')"
          form-field-name="establishedBy"
          class="col-span-2 md:col-span-1"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <TextInput
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_DIFFICULTY')"
          :description="t('QUESTION_DIFFICULTY')"
          :placeholder="t('PLACEHOLDER_DIFFICULTY')"
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

        <PositionSelectInput
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_POSITION_START')"
          :description="t('QUESTION_POSITION_START')"
          form-field-name="startPosition"
          :validator="buildPositionFormValidator({ required: true }, t)"
        />

        <PositionSelectInput
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_POSITION_END')"
          :description="t('QUESTION_POSITION_END')"
          form-field-name="endPosition"
          :validator="buildPositionFormValidator({ required: true }, t)"
        />

        <TextInput
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_YEAR_ESTABLISHED')"
          :description="t('QUESTION_YEAR_ESTABLISHED')"
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
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_DESCRIPTION')"
          :description="t('QUESTION_DESCRIPTION')"
          :placeholder="t('PLACEHOLDER_DESCRIPTION')"
          form-field-name="description"
          :validator="stringFormValidator({ required: false }, t)"
        />
        <MultilineTextInput
          input-class="h-16"
          class="col-span-2"
          :title="t('LABEL_TIPS')"
          :description="t('QUESTION_TIPS')"
          :placeholder="t('PLACEHOLDER_TIPS')"
          form-field-name="tips"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <TrickSelect
          input-class="h-16"
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_VARIANT_OF')"
          :description="t('QUESTION_VARIANT_OF')"
          form-field-name="variantOf"
          :validator="stringFormValidator({ required: false }, t)"
        />
        <TrickSelect
          input-class="h-16"
          class="col-span-2 md:col-span-1"
          :title="t('LABEL_RECOMMENDED_PREREQS')"
          :description="t('QUESTION_RECOMMENDED_PREREQS')"
          form-field-name="recommendedPrerequisites"
          :validator="stringFormValidator({ required: false }, t)"
        />
        <TrickSelect
          input-class="h-16"
          class="col-span-2"
          :title="t('LABEL_VIDEOS')"
          :description="t('QUESTION_VIDEOS')"
          form-field-name="videos"
          :validator="stringFormValidator({ required: false }, t)"
        />

        <div class="col-span-2 gap-2 inline-flex justify-end">
          <Button variant="ghost" @click="() => form.resetForm()"> {{ t('BUTTON_RESET') }} </Button>
          <Button type="submit"> {{ t('BUTTON_SUBMIT') }} </Button>
        </div>
      </form>
    </Section>
  </DefaultLayout>
</template>
