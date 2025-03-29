<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue/dist/iconify.js';

import Badge from './Badge.vue';
import { StickableStatus } from '@/lib/utils';
import messages from '@/i18n/common/stickableStatus';

const { t } = useI18n({
  messages: messages,
  scope: 'local',
});

defineProps<{
  status: StickableStatus;
}>();
</script>

<template>
  <Badge v-if="status === 'official'" variant="default" class="px-2 h-fit">
    <Icon icon="ic:round-check-circle" class="mr-1" />
    {{ t('official') }}
  </Badge>
  <Badge v-else-if="status === 'archived'" variant="destructive" class="px-2 h-fit">
    <Icon icon="ic:baseline-archive" class="mr-1" />
    {{ t('archived') }}
  </Badge>
  <Badge v-else-if="status === 'userDefined'" variant="secondary" class="px-2 h-fit">
    <Icon icon="ic:round-person" class="mr-1" />
    {{ t('userDefined') }}
  </Badge>
</template>
