<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
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
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuCheckboxItem from '@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue';
import Button from '@/components/ui/button/Button.vue';
import { StickableStatus } from '@/lib/utils';
import { useI18n } from 'vue-i18n';
import { i18nMerge } from '@/i18n/i18nmerge';
import messages from '@/i18n/searchMenu';
import messagesStickableStatus from '@/i18n/common/stickableStatus';

const { t } = useI18n({
  messages: i18nMerge(messages, messagesStickableStatus),
  useScope: 'local',
});

// eslint-disable-next-line no-undef
const searchParameters = defineModel<SearchParameters>('searchParameters');
if (searchParameters.value === undefined) {
  throw new Error('Search Parameters model needs to be passed to TrickSearchMenu!');
}

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
const activeSortingOption = ref<SortOrder>(searchParameters.value?.sortOrder);

watchEffect(async () => {
  if (searchParameters.value === undefined) {
    throw new Error('Search Parameters model needs to be passed to TrickSearchMenu!');
  }
  searchParameters.value.sortOrder = activeSortingOption.value;
});

// STATUS

function updateIncludedStatuses(status: StickableStatus) {
  if (searchParameters.value?.includedStatuses.includes(status)) {
    const newIncludedStatuses = searchParameters.value.includedStatuses.filter(
      (element) => element !== status
    );
    if (newIncludedStatuses.length > 0) {
      searchParameters.value.includedStatuses = newIncludedStatuses;
    }
    return;
  }
  searchParameters.value?.includedStatuses.push(status);
}

const includedStatusesTriggerVariant = computed(() => {
  const allOptionsChecked =
    searchParameters.value?.includedStatuses.includes('official') &&
    searchParameters.value?.includedStatuses.includes('userDefined') &&
    searchParameters.value?.includedStatuses.includes('archived');
  return allOptionsChecked ? 'secondary' : 'default';
});
</script>

<template>
  <section class="flex flex-col gap-1">
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
    </div>

    <div class="flex flex-row gap-1 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button :variant="includedStatusesTriggerVariant" size="sm">
            {{ t('includedStickableStatuses.triggerTitle') }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            :checked="searchParameters?.includedStatuses.includes('official')"
            @update:checked="updateIncludedStatuses('official')"
          >
            {{ t('official') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="searchParameters?.includedStatuses.includes('userDefined')"
            @update:checked="updateIncludedStatuses('userDefined')"
          >
            {{ t('userDefined') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :checked="searchParameters?.includedStatuses.includes('archived')"
            @update:checked="updateIncludedStatuses('archived')"
          >
            {{ t('archived') }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </section>
</template>
