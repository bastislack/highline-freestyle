<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { StickableStatus } from '@/lib/utils';

const props = defineProps<{
  isNew: boolean;
  status: StickableStatus;
}>();

const isUserDefined = computed(() => props.status === 'userDefined');
const isArchived = computed(() => props.status === 'archived');
const show = computed(() => props.isNew || isUserDefined.value || isArchived.value);
</script>

<template>
  <div v-if="show" class="absolute top-1 right-1">
    <Icon v-if="isUserDefined" icon="ic:round-person" />

    <Icon v-else-if="isArchived" icon="ic:baseline-archive" />

    <Icon v-else-if="isNew" icon="ic:baseline-new-releases" />
  </div>
</template>
