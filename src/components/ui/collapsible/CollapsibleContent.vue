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
// KeepAlive deactivation removes this element from the document and
// reactivation reinserts it. CSS spec restarts any matching animation rule
// on reinsertion, so an open Collapsible would replay its expand animation
// every time the user returns from a child route. Pin animation-name to
// 'none' once the user-triggered animation has finished — reka's watcher
// resets this on the next isOpen toggle, so real open/close gestures still
// animate normally.
function onAnimationDone(e: AnimationEvent) {
  if (e.target !== e.currentTarget) return;
  isAnimating.value = false;
  (e.currentTarget as HTMLElement).style.animationName = 'none';
}
</script>

<template>
  <CollapsibleContent
    v-bind="props"
    class="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
    :class="!isAnimating ? 'data-[state=open]:overflow-visible' : ''"
    @animationstart="onAnimationStart"
    @animationend="onAnimationDone"
    @animationcancel="onAnimationDone"
  >
    <slot />
  </CollapsibleContent>
</template>
