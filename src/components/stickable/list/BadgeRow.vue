<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import Badge from '@/components/ui/badge/Badge.vue';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/list';
import { StickableStatus } from '@/lib/utils';

const props = defineProps<{
  isNew: boolean;
  status: StickableStatus;
}>();

const { t } = useI18n({ messages, useScope: 'local' });

const isUserDefined = computed(() => props.status === 'userDefined');
const isArchived = computed(() => props.status === 'archived');
const show = computed(() => props.isNew || isUserDefined.value || isArchived.value);
</script>

<template>
  <div v-if="show" class="my-1 flex flex-row justify-center gap-1 flex-wrap">
    <Badge v-if="isUserDefined" class="px-2" variant="secondary">
      <Icon icon="ic:round-person" class="mr-1" />
      {{ t('cards.badges.personal') }}
    </Badge>

    <Badge v-else-if="isArchived" class="px-2" variant="destructive">
      <Icon icon="ic:baseline-archive" class="mr-1" />
      {{ t('cards.badges.archived') }}
    </Badge>

    <Badge
      v-if="isNew"
      class="px-2 bg-secondary-950 text-secondary-50 hover:bg-secondary-950"
      variant="secondary"
    >
      <Icon icon="ic:baseline-filter-vintage" class="mr-1" />
      {{ t('cards.badges.new') }}
    </Badge>
  </div>
</template>
