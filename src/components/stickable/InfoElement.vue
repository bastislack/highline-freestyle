<script setup lang="ts">
import { Icon } from '@iconify/vue';

import Separator from '@/components/ui/separator/Separator.vue';

defineProps<{
  title: string;
  icon: string;
  isInfoMissing?: boolean;
  missingMessage?: string;
  hasSeparatorOnBottom?: boolean;
}>();
</script>

<template>
  <div>
    <div class="flex flex-row items-center gap-2 mb-1">
      <Icon :icon="icon" class="w-6 h-6 align-baseline" />
      <div class="text-lg font-medium">{{ title }}</div>
    </div>
    <div :class="{ 'text-muted-foreground': isInfoMissing }" class="pl-8 text-sm">
      <div v-if="isInfoMissing">
        {{ missingMessage }}
      </div>
      <div v-else>
        <slot />
      </div>
      <Separator v-if="hasSeparatorOnBottom" class="mt-3" />
    </div>
  </div>
</template>
