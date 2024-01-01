<script setup lang="ts">
import { Icon } from '@iconify/vue';

import Separator from '@/components/ui/separator/Separator.vue';

defineProps<{
  title: string;
  icon: string;
  isInfoMissing?: boolean;
  missingMessage?: string;
}>();
</script>

<template>
  <div>
    <div class="flex flex-row items-center gap-1">
      <Icon :icon="icon" class="w-5 h-5 align-baseline" />
      <div class="text-lg">{{ title }}</div>
    </div>
    <Separator class="mb-2 mt-1" />
    <div :class="{ 'text-muted-foreground': isInfoMissing }" class="pl-6">
      <div v-if="isInfoMissing">
        {{ missingMessage }}
      </div>
      <div v-else>
        <slot />
      </div>
    </div>
  </div>
</template>
