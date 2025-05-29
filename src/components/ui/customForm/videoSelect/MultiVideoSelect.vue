<script lang="ts" setup>
import { ref } from 'vue';

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

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  class?: string;
}>();

type DbVideo = z.infer<typeof DbVideoZod>;

const link = ref<DbVideo['link']>('');
const startTime = ref<DbVideo['startTime']>(undefined);
const endTime = ref<DbVideo['endTime']>(undefined);

function initialStartingTime(): DbVideo['startTime'] {
  if (endTime.value === undefined) {
    return 0;
  }

  return Math.max(0, endTime.value - 1);
}

function initialEndTime(): DbVideo['endTime'] {
  if (startTime.value === undefined) {
    return 0;
  }

  const MAX_TIME_VALUE = 24 * 60 * 60 - 1;
  return Math.min(startTime.value + 1, MAX_TIME_VALUE);
}

function newVideoObjectFromFields(): DbVideo {
  return {
    link: link.value,
    startTime: startTime.value,
    endTime: endTime.value,
  };
}

function resetAddFields() {
  link.value = '';
  startTime.value = undefined;
  endTime.value = undefined;
}

/**
 * Takes a number of seconds and pretty prints in hh:mm:ss notation
 * e.g. 54 -> 00:00:54
 *      125 -> 00:02:05
 */
function hoursMinutesSecondsFromSeconds(seconds: number): string {
  let hours: number = Math.floor(seconds / 60 / 60);
  seconds -= hours * 60 * 60;

  let minutes: number = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return (
    zeroPadNumber(hours, 2) + ':' + zeroPadNumber(minutes, 2) + ':' + zeroPadNumber(seconds, 2)
  );
}

function zeroPadNumber(number_: number, minLength: number): string {
  return number_.toString().padStart(minLength, '0');
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
        <div
          v-if="componentField && componentField.modelValue && componentField.modelValue.length > 0"
          class="flex flex-col divide divide-y divide-border rounded-sm border border-border p-0"
        >
          <div
            v-for="(video, index) in componentField.modelValue"
            :key="video.url"
            class="p-3 flex flex-row items-center justify-between"
          >
            <div class="flex flex-col gap-2">
              <a :href="video.link" class="underline text-sm">{{ video.link }}</a>
              <div
                v-if="video.startTime !== undefined || video.endTime !== undefined"
                class="flex flex-row gap-5 w-64 text-sm text-muted-foreground"
              >
                <div v-if="video.startTime !== undefined" class="flex flex-row gap-1">
                  <Icon icon="ic:round-play-arrow" class="w-5 h-5" />
                  {{ hoursMinutesSecondsFromSeconds(video.startTime) }}
                </div>
                <div v-if="video.endTime !== undefined" class="flex flex-row gap-1">
                  <Icon icon="ic:round-stop" class="w-5 h-5" />
                  {{ hoursMinutesSecondsFromSeconds(video.endTime) }}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="p-0 rounded-full"
              @click="() => componentField.modelValue.splice(index, 1)"
            >
              <Icon icon="ic:round-close" class="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div class="flex flex-col gap-1 border border-border rounded-sm p-1">
          <Input
            type="text"
            placeholder="www.youtube.com/..."
            :modelValue="link"
            @update:model-value="(val) => (link = val.toString())"
          />

          <div class="flex flex-row gap-2 flex-wrap">
            <div>
              <FormLabel class="font-normal text-muted-foreground">Start</FormLabel>
              <div class="flex flex-row">
                <TimePicker
                  v-if="startTime !== undefined"
                  v-model:time="startTime"
                  @update:time="(value) => (startTime = value)"
                  with-seconds
                  with-label
                />
                <Button
                  v-if="startTime !== undefined"
                  variant="ghost"
                  size="icon"
                  class="px-1"
                  @click="() => (startTime = undefined)"
                >
                  <Icon icon="ic:round-close" class="w-5 h-5" />
                </Button>
                <Button
                  v-else
                  variant="outline"
                  class="font-normal px-3"
                  @click="() => (startTime = initialStartingTime())"
                >
                  <Icon icon="ic:round-add" class="w-6 h-6 mr-1" />
                  <span class="text-muted-foreground">(optional)</span>
                </Button>
              </div>
            </div>

            <div>
              <FormLabel class="font-normal text-muted-foreground">End</FormLabel>
              <div class="flex flex-row">
                <TimePicker
                  v-if="endTime !== undefined"
                  v-model:time="endTime"
                  @update:time="(value) => (endTime = value)"
                  with-seconds
                  with-label
                />
                <Button
                  v-if="endTime !== undefined"
                  variant="ghost"
                  size="icon"
                  class="px-1"
                  @click="() => (endTime = undefined)"
                >
                  <Icon icon="ic:round-close" class="w-5 h-5" />
                </Button>
                <Button
                  v-else
                  variant="outline"
                  class="font-normal px-3"
                  @click="() => (endTime = initialEndTime())"
                >
                  <Icon icon="ic:round-add" class="w-6 h-6 mr-1" />
                  <span class="text-muted-foreground">(optional)</span>
                </Button>
              </div>
            </div>
          </div>

          <Button
            variant="default"
            :disabled="link === undefined || link === ''"
            @click="
              () => {
                const newVideo = newVideoObjectFromFields();
                componentField.modelValue.push(newVideo);
                resetAddFields();
              }
            "
          >
            Add
          </Button>
        </div>
      </FormControl>
    </FormItem>
  </FormField>
</template>
