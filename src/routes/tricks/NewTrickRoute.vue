<script lang="ts" setup>
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import TextInput from '../../components/ui/form/TextInput.vue';
import { Ref, computed, ref } from 'vue';
import PositionSelectInput from '@/components/ui/form/PositionSelectInput.vue';
import { DbPositionZod } from '@/lib/database/schemas/CurrentVersionSchema';
import { z } from 'zod';
import NumberInput from '@/components/ui/form/NumberInput.vue';
import GenericFormElement from '@/components/ui/form/GenericFormElement.vue';

const trickName = ref('');
const trickNameIssues = computed(() =>
  trickName.value.trim().length > 0 ? [] : ['cannot be empty']
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

const establishedBy = ref('');
const yearEstablished = ref<number>();
const trickDifficulty = ref<number>();
</script>

<template>
  <DefaultLayout>
    <main class="max-w-4xl w-full mt-4 px-4">
      <h1 class="text-3xl my-4 font-black">Create a new custom trick</h1>

      <form class="grid gap-6 md:grid-cols-2">
        <TextInput
          id="technical-name-input"
          name="Technical Name"
          description="What's the trick's name?"
          v-model:value="trickName"
          :issues="trickNameIssues"
          :required="true"
          placeholder="My epic custom trick"
        />
        <TextInput
          id="established-by-input"
          name="Established By"
          description="Who originally came up with it?"
          v-model:value="establishedBy"
        />
        <PositionSelectInput
          v-model:value="startPosition"
          id="startPosition"
          name="Start Position"
          description="In what Position does the Trick start?"
          :issues="startPositionIssues"
        />
        <PositionSelectInput
          v-model:value="endPosition"
          id="endPosition"
          name="End Position"
          description="In what Position does the Trick end?"
          :issues="endPositionIssues"
        />
        <TextInput
          class="md:col-span-2"
          id="description"
          name="Description"
          description="Any details you wish to share about the trick?"
          v-model:value="descriptionString"
          :placeholder="'A fitting description'"
        />
        <TextInput
          class="md:col-span-2"
          id="tips"
          name="Tips"
          description="Do you have any tips to master this trick? Put each tip on a separate line"
          v-model:value="tipsString"
          :placeholder="'This is my first tip.\nAnd this is my second tip.'"
          multiline
        />
        <NumberInput
          id="yearEstablished"
          name="Year Established"
          description="Do you know when this trick was first introduced?"
          v-model:value="yearEstablished"
          :placeholder="'e.g. 2023'"
          :min="1900"
          :step="1"
        />
        <NumberInput
          id="difficulty"
          name="Difficulty"
          description="How hard is this trick? 1: Very easy, 10: Very hard"
          v-model:value="trickDifficulty"
          :placeholder="'2'"
          :min="0"
          :max="10"
          :step="1"
        />
        <GenericFormElement
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
      </form>
    </main>
  </DefaultLayout>
</template>
