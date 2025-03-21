<script lang="ts" setup>
import { cn, primaryKeysMatch } from '@/lib/utils';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Combobox from '../combobox/Combobox.vue';
import ComboboxAnchor from '../combobox/ComboboxAnchor.vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import {
  ComboboxList,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from '@/components/ui/combobox';
import { ref } from 'vue';
import { tricksDao } from '@/lib/database';
import { Trick } from '@/lib/database/daos/trick';
import StickableStatusBadge from '../badge/StickableStatusBadge.vue';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  title: string;
  description?: string;
  formFieldName: string;
  placeholder: string;
  noTrickFoundMessage: string;
  class?: string;
}>();

const loaded_tricks: Trick[] = await tricksDao.getAll();
// TODO: Get the actually currently selected ones
const selected = ref<Trick[]>([]);

function tricksWithoutSelected(): Trick[] {
  return loaded_tricks.filter(
    (trick) => !selected.value.find((sel) => primaryKeysMatch(sel.primaryKey, trick.primaryKey))
  );
}

function removeFromSelected(trick: Readonly<Trick>) {
  selected.value = selected.value.filter(
    (element) => !primaryKeysMatch(element.primaryKey, trick.primaryKey)
  );
}

function stickFrequencyColor(stickFrequency?: number) {
  stickFrequency = Math.max(0, Math.min(stickFrequency ?? 0, 7));
  return [
    'bg-background',
    'bg-skill1',
    'bg-skill2',
    'bg-skill3',
    'bg-skill4',
    'bg-skill5',
    'bg-skill6',
    'bg-skill7',
  ][stickFrequency];
}
</script>

<template>
  <FormField
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
          class="border border-border rounded p-0 divide-y overflow-hidden"
          v-if="selected.length > 0"
        >
          <div
            v-for="trick in selected"
            :key="trick.primaryKey.toString()"
            class="flex flex-row gap-2 items-center pl-3 pr-1 py-1 h-fit"
          >
            <div class="flex flex-col flex-auto gap-0 h-fit">
              <div class="flex flex-row items-center gap-2">
                {{ trick.alias ?? trick.technicalName }}
                <div
                  class="rounded-full h-2 w-2"
                  :class="stickFrequencyColor(trick.stickFrequency)"
                />
              </div>
              <div v-if="trick.alias" class="text-sm text-muted-foreground">
                {{ trick.technicalName }}
              </div>
            </div>
            <div class="flex flex-row flex-initial items-center justify-end">
              <div class="w-20">
                <StickableStatusBadge :status="trick.primaryKey[1]" />
              </div>
              <Button
                size="icon"
                variant="ghost"
                class="h-8 w-8 rounded-full"
                @click="() => removeFromSelected(trick)"
              >
                <Icon icon="ic:round-close" class="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <Combobox by="primaryKey">
          <ComboboxAnchor>
            <div class="relative w-full max-w-sm items-center">
              <ComboboxInput
                class="pl-9"
                :display-value="(val) => val?.alias ?? val?.technicalName ?? ''"
                :placeholder="placeholder"
              />
              <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                <Icon icon="ic:search" class="w-5 h-5 text-muted-foreground" />
              </span>
            </div>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxEmpty>
              {{ noTrickFoundMessage }}
            </ComboboxEmpty>

            <ComboboxGroup>
              <ComboboxItem
                v-for="trick in tricksWithoutSelected()"
                :key="trick.primaryKey.toString()"
                :value="trick.primaryKey"
                @select="selected.push(trick)"
              >
                {{ trick.alias ?? trick.technicalName }}
                <div
                  class="rounded-full h-2 w-2"
                  :class="stickFrequencyColor(trick.stickFrequency)"
                />
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </FormControl>
    </FormItem>
  </FormField>
</template>
