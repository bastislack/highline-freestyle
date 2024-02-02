<script lang="ts" setup>
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import TextInput from '../../components/ui/form/TextInput.vue';
import { Ref, computed, h, ref } from 'vue';
import PositionSelectInput from '@/components/ui/form/PositionSelectInput.vue';
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import { z } from 'zod';
import NumberInput from '@/components/ui/form/NumberInput.vue';
import Button from '@/components/ui/button/Button.vue';
import Section from '@/components/ui/section/Section.vue';

import GenericFormElement from '@/components/ui/form/GenericFormElement.vue';
import { useRouter } from 'vue-router';
import { CreateNewTrickType } from '@/lib/database/daos/tricksDao';
import databaseInstance from '@/lib/database/databaseInstance';
import { useToast, ToastAction } from '@/components/ui/toast';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/tricks/new/index';

const { t } = useI18n({
  messages,
  scope: 'local',
});

const router = useRouter();
const toast = useToast();

const createAnother = ref(false);

const technicalTrickName = ref('');
const aliasName = ref('');
const trickNameIssues = computed(() =>
  technicalTrickName.value.trim().length > 0 ? [] : ['cannot be empty']
);

const buildPositionValidator = (ref: Ref<z.infer<typeof DbPositionZod> | undefined>) => {
  return function () {
    if (typeof ref.value !== 'string') {
      return ['must be defined'];
    }
    const result = DbPositionZod.safeParse(ref.value);
    if (result.success) {
      return [];
    }
    return result.error.errors.map((e) => JSON.stringify(e.code));
  };
};

const startPosition = ref<z.infer<typeof DbPositionZod>>('Stand');
const endPosition = ref<z.infer<typeof DbPositionZod>>('Sit');
const startPositionIssues = computed(buildPositionValidator(startPosition));
const endPositionIssues = computed(buildPositionValidator(endPosition));

const tipsString = ref('');
const descriptionString = ref('');

const establishedByString = ref('');
const yearEstablishedString = ref('');
const trickDifficultyString = ref('');

const yearEstablishedIssues = computed(() => {
  if (yearEstablishedString.value.trim().length === 0) {
    return [];
  }

  const asNumber = Number(yearEstablishedString.value.trim());
  if (Number.isNaN(asNumber)) {
    return ['input is not a number'];
  }
  const issues: string[] = [];
  if (!Number.isInteger(asNumber)) {
    issues.push('please enter an integer (no commas)');
  }
  if (asNumber < 1900) {
    issues.push('select a year after 1900');
  }

  return issues;
});

const trickDifficultyIssues = computed(() => {
  if (trickDifficultyString.value.trim().length === 0) {
    return [];
  }

  const asNumber = Number(trickDifficultyString.value.trim());
  if (Number.isNaN(asNumber)) {
    return ['input is not a number'];
  }
  const issues: string[] = [];
  if (!Number.isInteger(asNumber)) {
    issues.push('please enter an integer (no commas)');
  }
  if (asNumber < 1 || asNumber > 10) {
    issues.push('make sure your input is between 1 and 10 (inclusive)');
  }

  return issues;
});

function reset() {
  startPosition.value = 'Stand';
  endPosition.value = 'Sit';
  [
    technicalTrickName,
    aliasName,
    tipsString,
    descriptionString,
    establishedByString,
    yearEstablishedString,
    trickDifficultyString,
  ].forEach((e) => (e.value = ''));
}

const canSubmit = computed(
  () =>
    ![
      trickNameIssues,
      startPositionIssues,
      endPositionIssues,
      yearEstablishedIssues,
      trickDifficultyIssues,
    ].some((e) => e.value.length > 0)
);

async function handleSubmit() {
  function setIfIsContentful<T = string>(
    input: Ref<string>,
    factory?: (val: string) => T
  ): T | undefined {
    const trimmed = input.value.trim();

    if (trimmed.length === 0) {
      return undefined;
    }

    factory ??= (val) => val as T;

    return factory(trimmed);
  }

  const technicalName = technicalTrickName.value.trim();
  const alias = setIfIsContentful(aliasName);
  const establishedBy = setIfIsContentful(establishedByString);
  const difficultyLevel = setIfIsContentful<number>(trickDifficultyString, Number);
  const description = setIfIsContentful(descriptionString);
  const tips = tipsString.value
    .split('\n')
    .filter((e) => e.trim().length > 0)
    .map((e) => e.trim());
  const yearEstablished = setIfIsContentful<number>(yearEstablishedString, Number);

  const trick: CreateNewTrickType = {
    technicalName,
    alias,
    dateAddedEpoch: new Date().getTime(),
    establishedBy,
    difficultyLevel,
    startPosition: startPosition.value,
    endPosition: endPosition.value,
    description,
    tips,
    yearEstablished,
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

    if (createAnother.value) {
      reset();
      toast.toast({
        title: t('TOAST_CREATED_TRICK', { name: result.alias ?? result.technicalName }),
        action: h(
          ToastAction,
          {
            altText: t('TOAST_GOTO_TRICK'),
            onClick: () => {
              router.push('/tricks/' + result.primaryKey[1] + '/' + result.primaryKey[0]);
            },
          },
          { default: () => t('TOAST_GOTO_TRICK') }
        ),
        duration: 5000,
      });
    } else {
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
    }
  } catch (err) {
    console.error(err);
    toast.toast({
      title: t('ERR_TOAST_TITLE'),
      description: t('ERR_TOAST_MESSAGE'),
      class: 'bg-destructive-700 text-white',
      duration: 5000,
    });
  }

  // TODO: Error Handling, Rerouting and Toast
}
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-3xl my-4 font-black">{{ t('TITLE_HEADING') }}</h1>

      <section class="grid gap-6 grid-cols-2">
        <TextInput
          class="col-span-2 md:col-span-1"
          id="technical-name-input"
          name="Technical Name"
          :description="t('QUESTION_TECHNICAL_NAME')"
          v-model:value="technicalTrickName"
          :issues="trickNameIssues"
          :required="true"
          :placeholder="t('PLACEHOLDER_TECHNICAL_NAME')"
        />
        <TextInput
          class="col-span-2 md:col-span-1"
          id="alias-name-input"
          name="Alias Name"
          :description="t('QUESTION_ALIAS_NAME')"
          v-model:value="aliasName"
          :placeholder="t('PLACEHOLDER_ALIAS_NAME')"
        />
        <TextInput
          class="col-span-2 md:col-span-1"
          id="established-by-input"
          name="Established By"
          :description="t('QUESTION_ESTABLISHED_BY')"
          v-model:value="establishedByString"
          :placeholder="t('PLACEHOLDER_ESTABLISHED_BY')"
        />
        <NumberInput
          class="col-span-2 md:col-span-1"
          id="difficulty"
          name="Difficulty"
          :description="t('QUESTION_DIFFICULTY')"
          v-model:value="trickDifficultyString"
          :placeholder="t('PLACEHOLDER_DIFFICULTY')"
          :min="0"
          :max="10"
          :step="1"
          :issues="trickDifficultyIssues"
        />
        <PositionSelectInput
          class="col-span-2 sm:col-span-1"
          v-model:value="startPosition"
          id="startPosition"
          name="Start Position"
          :description="t('QUESTION_POSITION_START')"
          :issues="startPositionIssues"
        />
        <PositionSelectInput
          class="col-span-2 sm:col-span-1"
          v-model:value="endPosition"
          id="endPosition"
          name="End Position"
          :description="t('QUESTION_POSITION_END')"
          :issues="endPositionIssues"
        />
        <TextInput
          class="col-span-2"
          id="description"
          name="Description"
          :description="t('QUESTION_DESCRIPTION')"
          :placeholder="t('PLACEHOLDER_DESCRIPTION')"
          v-model:value="descriptionString"
          multiline
        />

        <TextInput
          class="col-span-2"
          id="tips"
          name="Tips"
          :description="t('QUESTION_TIPS')"
          :placeholder="t('PLACEHOLDER_TIPS')"
          v-model:value="tipsString"
          multiline
        />
        <NumberInput
          class="col-span-2 md:col-span-1"
          id="yearEstablished"
          name="Year Established"
          :description="t('QUESTION_YEAR_ESTABLISHED')"
          v-model:value="yearEstablishedString"
          :placeholder="'e.g. 2023'"
          :min="1900"
          :step="1"
          :issues="yearEstablishedIssues"
        />
        <span />
        <GenericFormElement
          class="col-span-2 md:col-span-1"
          id="variantOf"
          name="Variant Of"
          :description="t('QUESTION_VARIANT_OF')"
        >
          <div
            class="w-full h-12 border border-neutral-700 flex justify-center items-center text-neutral-400 italic text-xs rounded-lg border-dashed"
          >
            {{ t('COMPONENT_NOT_IMPLEMENTED') }}
          </div>
        </GenericFormElement>
        <GenericFormElement
          class="col-span-2 md:col-span-1"
          id="recommendedPrereqs"
          name="Recommended Prerequisites"
          description="Are there any tricks you would recommend to learn before trying this one?"
        >
          <div
            class="w-full h-12 border border-neutral-700 flex justify-center items-center text-neutral-400 italic text-xs rounded-lg border-dashed"
          >
            {{ t('COMPONENT_NOT_IMPLEMENTED') }}
          </div>
        </GenericFormElement>
        <div v-if="!canSubmit" :class="`col-span-2 p-4 bg-red-200 flex flex-row rounded-lg`">
          <div class="inline-flex flex-col">
            <p class="text-lg">Summary</p>
            <p class="text-sm">
              There are still some issues. You need to fix those before you can create the trick.
            </p>
          </div>
        </div>
        <div class="col-span-2 inline-flex flex-row justify-end gap-1 flex-wrap">
          <div class="inline-flex flex-row items-center gap-2">
            <input type="checkbox" v-model="createAnother" id="create-another" />
            <abbr :title="t('CHECKBOX_ANOTHER_TRICK_HINT')">
              <label for="create-another">{{ t('CHECKBOX_ANOTHER_TRICK') }}</label>
            </abbr>
          </div>
          <div class="flex-1" />
          <div class="inline-flex gap-1">
            <Button
              @click="
                (ev) => {
                  ev.preventDefault();
                  router.back();
                }
              "
              variant="secondary"
            >
              Cancel
            </Button>
            <Button @click="() => handleSubmit()" :disabled="!canSubmit"> Create </Button>
          </div>
        </div>
      </section>
    </Section>
  </DefaultLayout>
</template>
