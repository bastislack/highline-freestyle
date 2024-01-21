<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';

import Button from '@/components/ui/button/Button.vue';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

defineProps<{
  title: string;
  code?: number;
  description?: string;
  debug?: string;
  hideImage?: boolean;
}>();

const isDebugOpen = ref(false);

function hasHistory(): boolean {
  return window.history.length > 2;
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-4">
    <div class="w-full flex flex-col items-center md:flex-row md:gap-3">
      <img
        v-if="!hideImage"
        src="@/assets/img/leashfall.svg"
        class="h-full md:w-auto max-h-72 sm:max-h-80 xl:max-h-96 p-3 pb-7 sm:py-4 md:pb-3"
      />
      <!--<div class="text-sm text-muted-foreground">Your request has taken a whipper!</div>-->

      <div class="grow w-full flex flex-col gap-1">
        <div class="w-full text-3xl font-bold text-justify">
          <span v-if="code"
            ><span class="text-primary">{{ code }}</span> -
          </span>
          {{ title }}
        </div>

        <div
          v-if="description && description.length > 0"
          class="w-full text-muted-foreground mt-2 text-justify"
        >
          {{ description }}
        </div>

        <Collapsible
          v-if="debug && debug.length > 0"
          v-model:open="isDebugOpen"
          class="w-full mt-2"
        >
          <div class="flex flex-row justify-between items-center text-muted-foreground">
            <div class="flex flex-row gap-1 items-center">
              <Icon icon="ic:round-code" class="w-5 h-5" />
              Debug info
            </div>
            <CollapsibleTrigger as-child>
              <Button variant="ghost" size="icon">
                <Icon
                  :icon="
                    isDebugOpen ? 'ic:round-keyboard-arrow-down' : 'ic:round-keyboard-arrow-left'
                  "
                  class="h-6 w-6"
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <Separator />
          <CollapsibleContent
            class="border borer-border rounded-md p-1 sm:p-2 font-mono text-xs bg-muted text-muted-foreground mt-2"
          >
            {{ debug }}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>

    <Button @click="hasHistory() ? $router.back() : $router.push('/')">
      {{ hasHistory() ? 'Back' : 'Home' }}
    </Button>
  </div>
</template>
