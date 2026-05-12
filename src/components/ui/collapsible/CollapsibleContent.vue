<script setup lang="ts">
import { CollapsibleContent, type CollapsibleContentProps } from 'reka-ui';
import { ref } from 'vue';

const props = defineProps<CollapsibleContentProps>();

// overflow-hidden is needed while the open/close animation drives the
// element's height — without it, content pops out before the height settles.
// Once the animation finishes (state=open, idle), descendants like a
// scale-on-press card need overflow-visible so they don't get clipped at the
// edges of the grid.
const isAnimating = ref(false);

function onAnimationStart(e: AnimationEvent) {
  if (e.target === e.currentTarget) isAnimating.value = true;
}
function onAnimationEnd(e: AnimationEvent) {
  if (e.target === e.currentTarget) isAnimating.value = false;
}
</script>

<template>
  <CollapsibleContent
    v-bind="props"
    class="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
    :class="!isAnimating ? 'data-[state=open]:overflow-visible' : ''"
    @animationstart="onAnimationStart"
    @animationend="onAnimationEnd"
  >
    <slot />
  </CollapsibleContent>
</template>
