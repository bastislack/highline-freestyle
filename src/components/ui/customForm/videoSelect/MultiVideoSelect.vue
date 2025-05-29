<script lang="ts" setup>
import { ref, watch } from 'vue';

import { cn } from '@/lib/utils';
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
import { TimestampSeconds } from '../../time-picker/time-picker-utils';

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  class?: string;
}>();

const time = ref(0);

watch(time, async (oldValue, newValue) => {
  console.log('Top level new value:', newValue);
});
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
        <div v-for="video in componentField.modelValue" :key="video.url">{{ video.url }}</div>
        <div class="flex flex-row">
          <Input type="text" placeholder="www.youtube.com/..." />
          <TimePicker
            v-model:time="time"
            @update:time="
              (value: TimestampSeconds) => {
                console.log('received value:', value);
                time = value;
              }
            "
            with-seconds
            with-label
          />
          <Button @click="() => componentField.modelValue.push({ url: '1234' })">Hahaa</Button>
        </div>
      </FormControl>
    </FormItem>
  </FormField>
</template>
