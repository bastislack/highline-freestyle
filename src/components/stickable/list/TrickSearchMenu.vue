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
import { defineModel } from 'vue';

const searchParameters = defineModel<SearchParameters>('searchParameters');
if (searchParameters.value === undefined) {
  throw new Error('Search Parameters model needs to be passed to TrickSearchMenu!');
}

const sortingOptions = [
  { title: 'Difficulty', directionTitle: 'Up', value: 'difficulty-asc' },
  { title: 'Difficulty', directionTitle: 'Down', value: 'difficulty-desc' },
  { title: 'Start Position', value: 'startPos' },
  { title: 'End Position', value: 'endPos' },
  { title: 'Invention year', directionTitle: 'Up', value: 'yearEstablished-asc' },
  { title: 'Invention year', directionTitle: 'Down', value: 'yearEstablished-desc' },
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
  <div class="flex flex-row gap-1 w-full h-fit p-2 my-2">
    <div class="grow">
      <Input placeholder="Search" />
    </div>

    <div class="w-[175px] flex-initial">
      <Select v-model="activeSortingOption">
        <SelectTrigger class="w-[175px] grow-0 shrink-0">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sorting</SelectLabel>
            <SelectItem v-for="option in sortingOptions" :value="option.value" :key="option.value">
              {{ option.title }}
              <span v-if="option.directionTitle" class="text-muted-foreground">{{
                option.directionTitle
              }}</span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
