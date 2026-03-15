<script setup lang="ts">
import { computed } from 'vue';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SortOrder } from '@/types/search';
import Switch from '@/components/ui/switch/Switch.vue';
import Button from '@/components/ui/button/Button.vue';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/searchMenu';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { RouterLink } from 'vue-router';
import { getShowVariationsAsTricks, setShowVariationsAsTricks } from '@/util/variationPreferences';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

const props = defineProps<{
  trickCount: number;
}>();

const searchText = defineModel<string | undefined>('searchText');
const sortOrder = defineModel<SortOrder>('sortOrder', { required: true });

// SORTING

const sortingOptions: { titleKey: string; directionTitleKey?: string; value: SortOrder }[] = [
  {
    titleKey: 'sortOptions.difficulty',
    directionTitleKey: 'sortOptions.ascending',
    value: 'difficulty-asc',
  },
  {
    titleKey: 'sortOptions.difficulty',
    directionTitleKey: 'sortOptions.descending',
    value: 'difficulty-desc',
  },
  { titleKey: 'sortOptions.startPosition', value: 'startPos' },
  { titleKey: 'sortOptions.endPosition', value: 'endPos' },
  {
    titleKey: 'sortOptions.inventionYear',
    directionTitleKey: 'sortOptions.ascending',
    value: 'yearEstablished-asc',
  },
  {
    titleKey: 'sortOptions.inventionYear',
    directionTitleKey: 'sortOptions.descending',
    value: 'yearEstablished-desc',
  },
];

// TEXT SEARCH

function resetSearchText() {
  searchText.value = undefined;
}

function setSearchText(text: string | number) {
  searchText.value = text.toString();
}

const textSearchContainsText = computed<boolean>(() => {
  return !!searchText.value;
});
</script>

<template>
  <section class="flex flex-col gap-1">
    <div class="flex flex-row gap-1 w-full h-fit">
      <div class="grow relative">
        <Input
          :placeholder="t('textSearchPlaceholder')"
          class="pr-10"
          :model-value="searchText"
          v-on:update:model-value="setSearchText"
        />
        <Button
          v-if="textSearchContainsText"
          variant="ghost"
          size="icon"
          class="absolute top-0 right-0"
          :onclick="resetSearchText"
        >
          <Icon icon="ic:round-close" class="h-5 w-5" />
        </Button>
      </div>

      <div class="w-[175px] flex-initial">
        <Select v-model="sortOrder" :disabled="textSearchContainsText">
          <SelectTrigger class="w-[175px] grow-0 shrink-0">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{{ t('sortOptionsLabel') }}</SelectLabel>
              <SelectItem
                v-for="option in sortingOptions"
                :value="option.value"
                :key="option.value"
              >
                {{ t(option.titleKey) }}
                <span v-if="option.directionTitleKey" class="text-muted-foreground">
                  {{ t(option.directionTitleKey) }}
                </span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="icon" as-child class="lg:hidden flex-none">
        <RouterLink to="/settings">
          <Icon icon="ic:round-settings" class="h-5 w-5" />
        </RouterLink>
      </Button>
    </div>

    <div class="flex flex-row items-center w-full gap-2">
      <label class="flex flex-row items-center gap-1 text-sm text-muted-foreground cursor-pointer">
        {{ t('variationsAsTricks') }}
        <Switch
          class="scale-75"
          :model-value="getShowVariationsAsTricks()"
          @update:model-value="(val: boolean) => setShowVariationsAsTricks(val)"
        />
      </label>
      <span v-if="props.trickCount > 0" class="text-sm text-muted-foreground ml-auto">
        {{ t('trickCount', { count: props.trickCount }, props.trickCount) }}
      </span>
    </div>
  </section>
</template>
