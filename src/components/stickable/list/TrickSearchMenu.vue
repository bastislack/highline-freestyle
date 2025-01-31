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
import { Icon } from '@iconify/vue/dist/iconify.js';
import DropdownMenuRadioGroup from '@/components/ui/dropdown-menu/DropdownMenuRadioGroup.vue';
import DropdownMenuRadioItem from '@/components/ui/dropdown-menu/DropdownMenuRadioItem.vue';
import DropdownMenuLabel from '@/components/ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '@/components/ui/dropdown-menu/DropdownMenuSeparator.vue';

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

watchEffect(() => {
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

const shouldStatusBeHighlighted = computed(
  () =>
    !(
      searchParameters.value?.includedStatuses.includes('official') &&
      searchParameters.value?.includedStatuses.includes('userDefined') &&
      searchParameters.value?.includedStatuses.includes('archived')
    )
);

// TEXT SEARCH

function resetSearchText() {
  if (searchParameters.value !== undefined) {
    searchParameters.value.searchText = undefined;
  }
}

function setSearchText(text: string | number) {
  if (searchParameters.value !== undefined) {
    searchParameters.value.searchText = text.toString();
  }
}

const textSearchContainsText = computed<boolean>(() => {
  return searchParameters.value !== undefined && !!searchParameters.value.searchText;
});

// FAVORITES

type FavoritesAtTopOptions = 'showAtTop' | 'dontShowAtTop';
const favoritesTreatment = ref<FavoritesAtTopOptions>(
  searchParameters.value.showFavoritesAtTop ? 'showAtTop' : 'dontShowAtTop'
);
watchEffect(() => {
  if (!searchParameters.value) {
    throw new Error('Search Parameters model needs to be passed to TrickSearchMenu!');
  }
  searchParameters.value.showFavoritesAtTop = favoritesTreatment.value === 'showAtTop';
});

// GENERAL
function highlightFilterClasses(highlight: boolean | undefined): string {
  return highlight ? 'font-medium' : 'font-normal';
}
</script>

<template>
  <section class="flex flex-col gap-1">
    <div class="flex flex-row gap-1 w-full h-fit">
      <div class="grow relative">
        <Input
          :placeholder="t('textSearchPlaceholder')"
          class="pr-10"
          :model-value="searchParameters?.searchText"
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
        <Select v-model="activeSortingOption" :disabled="textSearchContainsText">
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

    <div class="flex flex-row flex-wrap gap-1 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger as-child :disabled="textSearchContainsText">
          <Button
            variant="secondary"
            size="sm"
            :class="highlightFilterClasses(shouldStatusBeHighlighted)"
          >
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

      <DropdownMenu>
        <DropdownMenuTrigger as-child :disabled="textSearchContainsText">
          <Button
            variant="secondary"
            size="sm"
            :class="highlightFilterClasses(searchParameters?.showFavoritesAtTop)"
          >
            {{
              t(
                searchParameters?.showFavoritesAtTop
                  ? 'favoritesPlacement.triggerTitleTop'
                  : 'favoritesPlacement.triggerTitleRegular'
              )
            }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel> {{ t('favoritesPlacement.menuLabel') }} </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup v-model="favoritesTreatment">
            <DropdownMenuRadioItem value="showAtTop">
              {{ t('favoritesPlacement.radioItems.top') }}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dontShowAtTop">
              {{ t('favoritesPlacement.radioItems.regular') }}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </section>
</template>
