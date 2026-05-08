<script setup lang="ts">
import { computed } from 'vue';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button/Button.vue';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/searchMenu';
import { Icon } from '@iconify/vue/dist/iconify.js';

const { t } = useI18n({
  messages,
  useScope: 'local',
});

const props = defineProps<{
  trickCount: number;
  variationCount: number;
  totalCount: number;
  variationsAsTricks: boolean;
  showBreakdown: boolean;
  isLoading?: boolean;
}>();

const searchText = defineModel<string | undefined>('searchText');

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
          compose-immediate
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
    </div>

    <div
      v-if="props.isLoading"
      class="flex flex-row items-center w-full gap-2 justify-start animate-pulse"
      aria-hidden="true"
    >
      <div class="h-4 w-20 bg-muted rounded" />
    </div>
    <div
      v-else-if="props.totalCount > 0"
      class="flex flex-row items-center w-full gap-2 justify-start"
    >
      <span class="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
        <template v-if="props.variationsAsTricks || !props.showBreakdown">
          {{ t('trickCountLabel', { count: props.totalCount }, props.totalCount) }}
        </template>
        <template v-else>
          {{ t('trickCountLabel', { count: props.trickCount }, props.trickCount) }}
          ·
          {{ t('variationCountLabel', { count: props.variationCount }, props.variationCount) }}
        </template>
      </span>
    </div>
  </section>
</template>
