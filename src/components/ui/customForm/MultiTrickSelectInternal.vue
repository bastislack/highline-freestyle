<script setup lang="ts">
import { PrimaryKey, primaryKeysMatch } from '@/lib/utils';
import { useI18n } from 'vue-i18n';

import { Icon } from '@iconify/vue/dist/iconify.js';
import { tricksDao } from '@/lib/database';
import { Trick } from '@/lib/database/daos/trick';
import { StickableStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxAnchor,
  ComboboxList,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from '@/components/ui/combobox';
import messages from '@/i18n/tricks/multiTrickSelect';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

// eslint-disable-next-line no-undef
const selectedKeys = defineModel<PrimaryKey[]>('selected', { required: true });

const loaded_tricks: Trick[] = await tricksDao.getAll();

function tricksWithoutSelected(): Trick[] {
  return loaded_tricks.filter(
    (trick) =>
      !selectedKeys.value.find((selectedPK) => primaryKeysMatch(selectedPK, trick.primaryKey))
  );
}

function addToSelected(trick: Trick) {
  const regularPrimaryKey = removeReadOnlyFromPrimaryKey(trick.primaryKey);
  selectedKeys.value.push(regularPrimaryKey);
}

function removeFromSelected(trick: Readonly<Trick>) {
  selectedKeys.value = selectedKeys.value.filter(
    (selectedPK) => !primaryKeysMatch(selectedPK, trick.primaryKey)
  );
}

function removeReadOnlyFromPrimaryKey(primaryKey: Readonly<PrimaryKey>): PrimaryKey {
  return [primaryKey[0], primaryKey[1]];
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

function keyListToTrickList(primaryKeys?: PrimaryKey[]): Trick[] {
  if (primaryKeys === undefined) {
    return [];
  }
  const t = primaryKeys
    .map((pk) => loaded_tricks.find((trick) => primaryKeysMatch(trick.primaryKey, pk)))
    .filter(Boolean)
    .map((e) => (e ? e : (e as never))); // This makes Typescript happy. Yes, this is silly.
  console.log('keyListToTrickList', t);
  return t;
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      class="border border-border rounded p-0 divide-y overflow-hidden"
      v-if="selectedKeys && selectedKeys.length > 0"
    >
      <div
        v-for="trick in keyListToTrickList(selectedKeys)"
        :key="trick.primaryKey.toString()"
        class="flex flex-row gap-2 items-center pl-3 pr-1 py-1 h-fit"
      >
        <div class="flex flex-col flex-auto gap-0 h-fit">
          <div class="flex flex-row items-center gap-2">
            {{ trick.alias ?? trick.technicalName }}
            <div class="rounded-full h-2 w-2" :class="stickFrequencyColor(trick.stickFrequency)" />
          </div>
          <div v-if="trick.alias" class="text-sm text-muted-foreground">
            {{ trick.technicalName }}
          </div>
        </div>
        <div class="flex flex-row flex-initial items-center justify-end">
          <div class="w-22">
            <StickableStatusBadge :status="trick.primaryKey[1]" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            class="h-8 w-8 rounded-full"
            @click="
              () => {
                removeFromSelected(trick);
              }
            "
          >
            <Icon icon="ic:round-close" class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>

    <Combobox by="primaryKey">
      <ComboboxAnchor class="relative w-full max-w-sm items-center">
        <ComboboxInput
          class="pl-9"
          :display-value="(val) => val?.alias ?? val?.technicalName ?? ''"
          :placeholder="t('searchPlaceholder')"
        />
        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
          <Icon icon="ic:search" class="w-5 h-5 text-muted-foreground" />
        </span>
      </ComboboxAnchor>

      <ComboboxList>
        <ComboboxEmpty>
          {{ t('noTrickMatchingSearch') }}
        </ComboboxEmpty>

        <ComboboxGroup>
          <ComboboxItem
            v-for="trick in tricksWithoutSelected()"
            :key="trick.primaryKey.toString()"
            :value="trick.primaryKey"
            @select="addToSelected(trick)"
          >
            {{ trick.alias ?? trick.technicalName }}
            <div class="rounded-full h-2 w-2" :class="stickFrequencyColor(trick.stickFrequency)" />
          </ComboboxItem>
        </ComboboxGroup>
      </ComboboxList>
    </Combobox>
  </div>
</template>
