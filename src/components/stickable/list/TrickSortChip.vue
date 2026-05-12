<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import messages from '@/i18n/searchMenu';
import { SortField, SortOrder } from '@/types/search';
import { buildSortOrder, parseSortOrder, sortFieldOptions } from '@/routes/tricks/sortingOptions';

const { t } = useI18n({ messages, useScope: 'local' });

defineProps<{ disabled?: boolean }>();
const sortOrder = defineModel<SortOrder>('sortOrder', { required: true });

const current = computed(() => parseSortOrder(sortOrder.value));
const currentFieldLabel = computed(() => {
  const option = sortFieldOptions.find((o) => o.value === current.value.field);
  return option ? t(option.titleKey) : '';
});

function selectField(field: string) {
  sortOrder.value = buildSortOrder(field as SortField, current.value.direction);
}

function toggleDirection() {
  const next = current.value.direction === 'asc' ? 'desc' : 'asc';
  sortOrder.value = buildSortOrder(current.value.field, next);
}
</script>

<template>
  <div class="flex flex-row items-center gap-1">
    <span class="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
      {{ t('sortByLabel') }}
    </span>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm" class="h-7 px-2 text-xs sm:text-sm" :disabled="disabled">
          {{ currentFieldLabel }}
          <Icon icon="ic:round-arrow-drop-down" class="h-4 w-4 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup :model-value="current.field" @update:model-value="selectField">
          <DropdownMenuRadioItem
            v-for="option in sortFieldOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ t(option.titleKey) }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button
      variant="ghost"
      size="icon"
      class="h-7 w-7"
      :disabled="disabled"
      :aria-label="
        current.direction === 'asc' ? t('sortOptions.ascending') : t('sortOptions.descending')
      "
      @click="toggleDirection"
    >
      <Icon
        :icon="current.direction === 'asc' ? 'ic:round-arrow-upward' : 'ic:round-arrow-downward'"
        class="h-4 w-4"
      />
    </Button>
  </div>
</template>
