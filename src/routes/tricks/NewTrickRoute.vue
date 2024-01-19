<script lang="ts" setup>
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import TextInput from '../../components/ui/form/TextInput.vue';
import { Ref, computed, ref } from 'vue';
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

const router = useRouter();

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

  const result = await databaseInstance.tricksDao.createNew(trick, 'userDefined');
  console.log('id of new trick is ' + result.primaryKey);

  // TODO: Error Handling, Rerouting and Toast
}
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-3xl my-4 font-black">Create a new custom trick</h1>

      <section class="grid gap-6 grid-cols-2">
        <TextInput
          class="col-span-2 md:col-span-1"
          id="technical-name-input"
          name="Technical Name"
          description="What's the trick's technical name?"
          v-model:value="technicalTrickName"
          :issues="trickNameIssues"
          :required="true"
          placeholder="180 Chestroll Crazyness"
        />
        <TextInput
          class="col-span-2 md:col-span-1"
          id="alias-name-input"
          name="Alias Name"
          description="What do you actually call this?"
          v-model:value="aliasName"
          placeholder="Chewbacca"
        />
        <TextInput
          class="col-span-2 md:col-span-1"
          id="established-by-input"
          name="Established By"
          description="Who originally came up with it?"
          v-model:value="establishedByString"
          placeholder="Ian, probably"
        />
        <NumberInput
          class="col-span-2 md:col-span-1"
          id="difficulty"
          name="Difficulty"
          description="How hard is this trick? 1: Very easy, 10: Very hard. Keep this empty if you're not sure."
          v-model:value="trickDifficultyString"
          placeholder="I'm not sure"
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
          description="In what Position does the Trick start?"
          :issues="startPositionIssues"
        />
        <PositionSelectInput
          class="col-span-2 sm:col-span-1"
          v-model:value="endPosition"
          id="endPosition"
          name="End Position"
          description="In what Position does the Trick end?"
          :issues="endPositionIssues"
        />
        <TextInput
          class="col-span-2"
          id="description"
          name="Description"
          description="Any details you wish to share about the trick?"
          v-model:value="descriptionString"
          :placeholder="'A fitting description'"
        />

        <TextInput
          class="col-span-2"
          id="tips"
          name="Tips"
          description="Do you have any tips to master this trick? Put each tip on a separate line"
          v-model:value="tipsString"
          :placeholder="'This is my first tip.\nAnd this is my second tip.'"
          multiline
        />
        <NumberInput
          class="col-span-2 md:col-span-1"
          id="yearEstablished"
          name="Year Established"
          description="Do you know when this trick was first introduced?"
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
          description="Is this a variant of any other trick?"
        >
          <div
            class="w-full h-12 border border-neutral-700 flex justify-center items-center text-neutral-400 italic text-xs rounded-lg border-dashed"
          >
            This component has yet to be implemented
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
            This component has yet to be implemented
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
        <div class="col-span-2 inline-flex flex-col sm:flex-row justify-end gap-1">
          <div class="inline-flex flex-row items-center gap-2">
            <input type="checkbox" id="create-another" />
            <abbr
              title="Checking this will not switch you to your newly created trick. This can be useful if you want to create multiple tricks."
            >
              <label for="create-another">Create another trick afterwards</label>
            </abbr>
          </div>
          <div class="flex-1" />
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
      </section>
    </Section>
  </DefaultLayout>
</template>
