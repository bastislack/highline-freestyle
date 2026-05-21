<script lang="ts" setup>
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import messages from '@/i18n/tricks/new/index';
import messagesPositions from '@/i18n/common/positions';
import { i18nMerge } from '@/i18n/i18nmerge';
import { DbPositionZod, DbReferenceZod } from '@/lib/database/schemas/CurrentVersionSchema';

import { Button } from '@/components/ui/button';
import Switch from '@/components/ui/switch/Switch.vue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import PositionSelectInput from '@/components/ui/customForm/PositionSelectInput.vue';
import MultilineTextInput from '@/components/ui/customForm/MultilineTextInput.vue';
import TextInput from '@/components/ui/customForm/TextInput.vue';
import MultiTrickSelect from '@/components/ui/customForm/MultiTrickSelect.vue';
import MultiVideoSelect from '@/components/ui/customForm/MultiVideoSelect.vue';

const currentYear = new Date().getFullYear();

const trickFormSchema = z
  .object({
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
    videos: z
      .array(
        z.object({
          link: z
            .string()
            .min(1, { message: 'INPUT_REQUIRED_URL' })
            .url({ message: 'INPUT_INVALID_URL' }),
          startTime: z.number().min(0).optional(),
          endTime: z.number().min(0).optional(),
        })
      )
      .optional(),
    suggestAsOfficial: z.boolean().default(false),
    email: z.string().optional(),
  })
  .superRefine((vals, ctx) => {
    if (!vals.suggestAsOfficial) return;

    const requireString = (field: 'description' | 'establishedBy', value: string | undefined) => {
      if (!value || value.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'INPUT_REQUIRED',
        });
      }
    };
    requireString('description', vals.description);
    requireString('establishedBy', vals.establishedBy);

    if (vals.difficulty === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['difficulty'],
        message: 'INPUT_REQUIRED',
      });
    }
    if (vals.yearEstablished === '' || vals.yearEstablished === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yearEstablished'],
        message: 'INPUT_REQUIRED',
      });
    }

    const trimmed = vals.email?.trim() ?? '';
    if (trimmed === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'INPUT_REQUIRED',
      });
      return;
    }
    if (!z.string().email().safeParse(trimmed).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'INPUT_INVALID_EMAIL',
      });
    }
  });

export type TrickFormSchema = z.infer<typeof trickFormSchema>;

type TrickFormInitialValues = Omit<Partial<TrickFormSchema>, 'tips'> & { tips?: string };

const props = withDefaults(
  defineProps<{
    initialValues?: TrickFormInitialValues;
    submitLabel: string;
    submitLabelSuggested?: string;
    showSuggestionToggle?: boolean;
  }>(),
  {
    showSuggestionToggle: true,
  }
);

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
    suggestAsOfficial: false,
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
    <template v-if="showSuggestionToggle">
      <FormField v-slot="{ value, handleChange }" name="suggestAsOfficial">
        <FormItem
          class="col-span-4 flex flex-row items-center justify-between gap-4 rounded-lg border p-3"
        >
          <div class="flex flex-col gap-0.5">
            <FormLabel class="font-bold">{{ t('label.suggestAsOfficial') }}</FormLabel>
            <FormDescription>{{ t('question.suggestAsOfficial') }}</FormDescription>
          </div>
          <FormControl>
            <Switch :model-value="value" @update:model-value="handleChange" />
          </FormControl>
        </FormItem>
      </FormField>

      <Alert v-if="form.values.suggestAsOfficial" variant="default" class="col-span-4">
        <Icon icon="ic:outline-info" class="w-5 h-5" />
        <AlertTitle class="pl-3">{{ t('suggestAsOfficialAlert.title') }}</AlertTitle>
        <AlertDescription class="pl-3">
          {{ t('suggestAsOfficialAlert.description') }}
        </AlertDescription>
      </Alert>

      <TextInput
        v-if="form.values.suggestAsOfficial"
        class="col-span-4"
        :title="t('label.email')"
        :description="t('question.email')"
        :placeholder="t('placeholder.email')"
        form-field-name="email"
        type="email"
        inputMode="email"
        required
      />
    </template>

    <TextInput
      :title="t('label.technicalName')"
      :placeholder="t('placeholder.technicalName')"
      form-field-name="technicalName"
      class="col-span-4 md:col-span-2"
      required
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
      required
    />

    <PositionSelectInput
      class="col-span-2 md:col-span-1"
      :title="t('label.positionEnd')"
      form-field-name="endPosition"
      required
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
      :required="form.values.suggestAsOfficial"
    />

    <MultilineTextInput
      input-class="h-16"
      class="col-span-4"
      :title="t('label.description')"
      :placeholder="t('placeholder.description')"
      form-field-name="description"
      :required="form.values.suggestAsOfficial"
    />

    <TextInput
      :title="t('label.establishedBy')"
      :placeholder="t('placeholder.establishedBy')"
      form-field-name="establishedBy"
      class="col-span-4 md:col-span-2"
      :required="form.values.suggestAsOfficial"
    />

    <TextInput
      class="col-span-4 md:col-span-2"
      :title="t('label.inTheYear')"
      placeholder="2024"
      form-field-name="yearEstablished"
      inputMode="numeric"
      type="number"
      :error-values="{ min: '1900', max: currentYear.toString() }"
      :required="form.values.suggestAsOfficial"
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
      <Button type="submit">
        {{
          showSuggestionToggle && form.values.suggestAsOfficial && submitLabelSuggested
            ? submitLabelSuggested
            : submitLabel
        }}
      </Button>
    </div>
  </form>
</template>
