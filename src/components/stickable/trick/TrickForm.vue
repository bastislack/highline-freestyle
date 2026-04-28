<script lang="ts" setup>
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import messages from '@/i18n/tricks/new/index';
import messagesPositions from '@/i18n/common/positions';
import { i18nMerge } from '@/i18n/i18nmerge';
import {
  DbPositionZod,
  DbReferenceZod,
  DbVideoZod,
} from '@/lib/database/schemas/CurrentVersionSchema';

import { Button } from '@/components/ui/button';
import PositionSelectInput from '@/components/ui/customForm/PositionSelectInput.vue';
import MultilineTextInput from '@/components/ui/customForm/MultilineTextInput.vue';
import TextInput from '@/components/ui/customForm/TextInput.vue';
import MultiTrickSelect from '@/components/ui/customForm/MultiTrickSelect.vue';
import MultiVideoSelect from '@/components/ui/customForm/MultiVideoSelect.vue';

const currentYear = new Date().getFullYear();

const trickFormSchema = z.object({
  technicalName: z.string().trim().min(1),
  alias: z.string().optional(),
  establishedBy: z.string().optional(),
  difficulty: z.union([
    z
      .number()
      .int({ message: 'INPUT_NOT_INTEGER' })
      .min(1, { message: 'INPUT_NUMBER_BELOW_MIN' })
      .max(20, { message: 'INPUT_NUMBER_ABOVE_MAX' }),
    z.literal(''),
  ]),
  startPosition: DbPositionZod,
  endPosition: DbPositionZod,
  description: z.string().optional(),
  tips: z
    .preprocess(
      (val) => {
        if (typeof val === 'string') {
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
      .max(currentYear, { message: 'INPUT_NUMBER_ABOVE_MAX' })
      .optional(),
    z.literal(''),
  ]),
  variationOf: z.array(DbReferenceZod).optional(),
  recommendedPrerequisites: z.array(DbReferenceZod).optional(),
  videos: z.array(DbVideoZod).optional(),
});

export type TrickFormSchema = z.infer<typeof trickFormSchema>;

type TrickFormInitialValues = Omit<Partial<TrickFormSchema>, 'tips'> & { tips?: string };

const props = defineProps<{
  initialValues?: TrickFormInitialValues;
  submitLabel: string;
}>();

const emit = defineEmits<{
  submit: [vals: TrickFormSchema];
  cancel: [];
}>();

const { t } = useI18n({
  messages: i18nMerge(messages, messagesPositions),
  scope: 'local',
});

const validationSchema = toTypedSchema(trickFormSchema);

const form = useForm<TrickFormSchema>({
  validationSchema,
  initialValues: {
    startPosition: DbPositionZod.Values.Rocket,
    endPosition: DbPositionZod.Values.Buddha,
    difficulty: '',
    variationOf: [],
    recommendedPrerequisites: [],
    videos: [],
    ...(props.initialValues as unknown as Partial<TrickFormSchema>),
  },
});

const handleSubmit = form.handleSubmit(
  (vals) => emit('submit', vals),
  (errors) => console.warn('TrickForm validation failed', errors)
);

defineExpose({ meta: form.meta });
</script>

<template>
  <form class="grid gap-4 lg:gap-6 grid-cols-4" @submit="handleSubmit">
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
      :error-values="{ min: '1900', max: currentYear.toString() }"
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

    <MultiVideoSelect class="col-span-4" :title="t('label.videos')" form-field-name="videos" />

    <div class="col-span-4 gap-2 inline-flex justify-end">
      <Button type="button" variant="ghost" class="hidden lg:inline-flex" @click="emit('cancel')">
        {{ t('buttonCancel') }}
      </Button>
      <Button type="submit">{{ submitLabel }}</Button>
    </div>
  </form>
</template>
