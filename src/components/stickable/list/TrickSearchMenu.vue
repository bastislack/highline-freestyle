<script setup lang="ts">
import { ref, watchEffect } from 'vue';
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
import { SearchParameters, SortOrder } from '@/types/search';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/searchMenu';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

// eslint-disable-next-line no-undef
const searchParameters = defineModel<SearchParameters>('searchParameters');
if (searchParameters.value === undefined) {
  throw new Error('Search Parameters model needs to be passed to TrickSearchMenu!');
}

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
const activeSortingOption = ref<SortOrder>(searchParameters.value?.sortOrder);

watchEffect(async () => {
  if (searchParameters.value === undefined) {
    throw new Error('Search Parameters model needs to be passed to TrickSearchMenu!');
  }
  searchParameters.value.sortOrder = activeSortingOption.value;
});
</script>

<template>
  <div class="flex flex-row gap-1 w-full h-fit">
    <div class="grow">
      <Input :placeholder="t('textSearchPlaceholder')" />
    </div>

    <div class="w-[175px] flex-initial">
      <Select v-model="activeSortingOption">
        <SelectTrigger class="w-[175px] grow-0 shrink-0">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{{ t('sortOptionsLabel') }}</SelectLabel>
            <SelectItem v-for="option in sortingOptions" :value="option.value" :key="option.value">
              {{ t(option.titleKey) }}
              <span v-if="option.directionTitleKey" class="text-muted-foreground">
                {{ t(option.directionTitleKey) }}
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
