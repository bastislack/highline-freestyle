<script lang="ts" setup>
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/vue/dist/iconify.js';
import {
  FormField,
  FormLabel,
  FormItem,
  FormDescription,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import TimePicker from '@/components/ui/time-picker/TimePicker.vue';
import { DbVideoZod } from '@/lib/database/schemas/CurrentVersionSchema.ts';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/ui/multiVideoSelect';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  class?: string;
}>();

type DbVideo = z.infer<typeof DbVideoZod>;

function initialStartTime(video: DbVideo): number {
  if (video.endTime === undefined) return 0;
  return Math.max(0, video.endTime - 1);
}

function initialEndTime(video: DbVideo): number {
  if (video.startTime === undefined) return 0;
  const MAX_TIME_VALUE = 24 * 60 * 60 - 1;
  return Math.min(video.startTime + 1, MAX_TIME_VALUE);
}

function normalizeLink(video: DbVideo) {
  const trimmed = video.link.trim();
  if (trimmed === '') return;
  if (!/^https?:\/\//i.test(trimmed)) {
    video.link = 'https://' + trimmed;
  } else if (trimmed !== video.link) {
    video.link = trimmed;
  }
}
</script>

<template>
  <FormField
    v-slot="{ componentField }"
    :name="formFieldName"
    :validate-on-change="true"
    :validate-on-input="true"
    :validate-on-blur="true"
  >
    <FormItem :class="cn('flex flex-col justify-stretch', props.class)">
      <FormLabel class="font-bold">{{ title }}</FormLabel>
      <FormDescription v-if="description">
        {{ description }}
      </FormDescription>
      <FormMessage />

      <FormControl>
        <div class="flex flex-col gap-2">
          <div
            v-for="(video, index) in componentField.modelValue ?? []"
            :key="index"
            class="flex flex-col gap-1 border border-border rounded-sm p-2 relative"
          >
            <Button
              variant="ghost"
              size="icon"
              type="button"
              class="absolute top-1 right-1 p-0 rounded-full"
              @click="() => componentField.modelValue.splice(index, 1)"
            >
              <Icon icon="ic:round-close" class="w-5 h-5" />
            </Button>

            <div class="flex flex-col lg:flex-row gap-1 pr-8">
              <div class="grow-1 w-full">
                <FormLabel class="font-normal text-muted-foreground">{{
                  t('labels.url')
                }}</FormLabel>
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/..."
                  :modelValue="video.link"
                  @update:model-value="(val) => (video.link = val.toString())"
                  @blur="() => normalizeLink(video)"
                />
              </div>

              <div class="flex flex-row gap-2 flex-wrap w-fit shrink-0 grow-0">
                <div>
                  <FormLabel class="font-normal text-muted-foreground">{{
                    t('labels.start')
                  }}</FormLabel>
                  <div class="flex flex-row">
                    <TimePicker
                      v-if="video.startTime !== undefined"
                      :time="video.startTime"
                      @update:time="(value) => (video.startTime = value)"
                      with-seconds
                    />
                    <Button
                      v-if="video.startTime !== undefined"
                      variant="ghost"
                      size="icon"
                      type="button"
                      class="px-1"
                      @click="() => (video.startTime = undefined)"
                    >
                      <Icon icon="ic:round-close" class="w-5 h-5" />
                    </Button>
                    <Button
                      v-else
                      variant="outline"
                      type="button"
                      class="font-normal px-3"
                      @click="() => (video.startTime = initialStartTime(video))"
                    >
                      <Icon icon="ic:round-add" class="w-6 h-6 mr-1" />
                      <span class="text-muted-foreground">({{ t('buttons.optional') }})</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <FormLabel class="font-normal text-muted-foreground">{{
                    t('labels.end')
                  }}</FormLabel>
                  <div class="flex flex-row">
                    <TimePicker
                      v-if="video.endTime !== undefined"
                      :time="video.endTime"
                      @update:time="(value) => (video.endTime = value)"
                      with-seconds
                    />
                    <Button
                      v-if="video.endTime !== undefined"
                      variant="ghost"
                      size="icon"
                      type="button"
                      class="px-1"
                      @click="() => (video.endTime = undefined)"
                    >
                      <Icon icon="ic:round-close" class="w-5 h-5" />
                    </Button>
                    <Button
                      v-else
                      variant="outline"
                      type="button"
                      class="font-normal px-3"
                      @click="() => (video.endTime = initialEndTime(video))"
                    >
                      <Icon icon="ic:round-add" class="w-6 h-6 mr-1" />
                      <span class="text-muted-foreground">({{ t('buttons.optional') }})</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            class="self-start font-normal"
            @click="
              () => {
                if (!componentField.modelValue) componentField.modelValue = [];
                componentField.modelValue.push({ link: '' });
              }
            "
          >
            <Icon icon="ic:round-add" class="w-5 h-5 mr-1" />
            {{ t('buttons.addVideo') }}
          </Button>
        </div>
      </FormControl>
    </FormItem>
  </FormField>
</template>
