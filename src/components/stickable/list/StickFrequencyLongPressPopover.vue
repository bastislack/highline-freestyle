<script setup lang="ts">
import { ref, computed, inject, onDeactivated, onUnmounted, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { onLongPress } from '@vueuse/core';
import { Popover, PopoverContent } from '@/components/ui/popover';
import TrickStickFrequencySelector from '@/components/stickable/stickFrequencySelector/TrickStickFrequencySelector.vue';
import type { StickableStatus } from '@/lib/utils';
import { stickFrequencyOverridesKey, frequencyOverrideKey } from './stickFrequencyOverridesKey';
import { reportNestedPopoverOpen, usePopoverAutoClose } from '@/composables/usePopoverAutoClose';

const props = defineProps<{
  trickId: number;
  trickStatus: StickableStatus;
}>();

const containerRef = ref<HTMLElement>();
const isOpen = ref(false);
const isPressing = ref(false);
const suppressClick = ref(false);
// The reka-ui Popover + PopoverContent subtree is the heaviest part of this
// component, and the list mounts one per trick card. Defer it until the user
// actually touches the card so the bulk-mount cost during sort/search churn
// only pays for the lightweight refs, listeners, and long-press wiring.
const hasInteracted = ref(false);

// Host (e.g. TrickList) provides a reactive overrides map. Writing here
// re-renders only the card(s) that read this key — no list-wide cascade.
const overrides = inject(stickFrequencyOverridesKey, null);

function onChange(frequency: number) {
  overrides?.set(frequencyOverrideKey([props.trickId, props.trickStatus]), frequency);
}

const LONG_PRESS_DELAY = 500;
// Press-affordance threshold sits well before LONG_PRESS_DELAY so the scale
// becomes visible during the hold, before the popover opens — but late enough
// that a quick tap doesn't briefly trigger the scale animation.
const PRESS_AFFORDANCE_DELAY = 200;

onLongPress(
  containerRef,
  () => {
    isOpen.value = true;
    suppressClick.value = true;
  },
  { delay: LONG_PRESS_DELAY, modifiers: { prevent: true } }
);
let pressTimer: ReturnType<typeof setTimeout> | null = null;

// Safety net for missed pointerup/cancel: once we flip `isPressing`, the card
// is teleported into <body>, and on some browsers that DOM move breaks the
// implicit pointer capture set on pointerdown — so the local `@pointerup` and
// `@pointercancel` listeners never fire and `isPressing` would stay `true`
// forever (keeping the ghost permanently floating, even across navigations
// because the teleport target is outside this component's tree). Window-level
// listeners catch the end of the gesture regardless of where it lands.
let activePointerId: number | null = null;
function onWindowPointerEnd(e: PointerEvent) {
  if (activePointerId === null || e.pointerId === activePointerId) endPress();
}
function attachWindowListeners(pointerId: number) {
  activePointerId = pointerId;
  window.addEventListener('pointerup', onWindowPointerEnd);
  window.addEventListener('pointercancel', onWindowPointerEnd);
}
function detachWindowListeners() {
  activePointerId = null;
  window.removeEventListener('pointerup', onWindowPointerEnd);
  window.removeEventListener('pointercancel', onWindowPointerEnd);
}

function onPointerDown(e: PointerEvent) {
  // First-touch flip mounts the reka-ui Popover before the long-press timer
  // fires 500ms later, so the popover is ready by the time the user expects it.
  hasInteracted.value = true;
  suppressClick.value = false;
  attachWindowListeners(e.pointerId);
  pressTimer = setTimeout(() => {
    isPressing.value = true;
    pressTimer = null;
  }, PRESS_AFFORDANCE_DELAY);
}
function endPress() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
  isPressing.value = false;
  detachWindowListeners();
}
// Long-press fires before pointerup, so the synthetic click that follows would
// otherwise navigate. Capture-phase preventDefault + stopPropagation swallows
// it before RouterLink's listener runs.
//
// Also: while the popover is open, any click on the card itself acts like a
// click on the backdrop — dismiss the popover, swallow the underlying action
// (navigation, variations dropdown, etc).
function onClickCapture(e: MouseEvent) {
  if (suppressClick.value) {
    e.preventDefault();
    e.stopPropagation();
    suppressClick.value = false;
    return;
  }
  if (isOpen.value) {
    e.preventDefault();
    e.stopPropagation();
    isOpen.value = false;
  }
}

const virtualReference = {
  getBoundingClientRect() {
    return containerRef.value?.getBoundingClientRect() ?? new DOMRect();
  },
};

// When pressing/open, teleport the card to <body> so its scale-up isn't
// clipped or z-trapped by an outer popover's stacking context. A v-show
// spacer keeps the grid cell occupied so siblings don't reflow.
const showGhost = computed(() => isPressing.value || isOpen.value);
const ghostRect = ref<DOMRect | null>(null);
// Scale flips ~1 frame after showGhost so the browser sees a stable
// position:fixed baseline first, then transform:scale changing — otherwise
// the reparent + layout-mode flip + scale all land in one frame and the
// transition is skipped (card pops straight to its scaled size).
const isScaled = ref(false);

watch(showGhost, (show, prev) => {
  if (show && !prev && containerRef.value) {
    // Snapshot the rect from the in-grid position before the teleport flips —
    // afterwards getBoundingClientRect would return the new (body) coordinates.
    ghostRect.value = containerRef.value.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (showGhost.value) isScaled.value = true;
      });
    });
  } else if (!show) {
    isScaled.value = false;
  }
});

const ghostStyle = computed(() => {
  if (!showGhost.value || !ghostRect.value) return undefined;
  const r = ghostRect.value;
  return {
    position: 'fixed' as const,
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  };
});

// The placeholder must hold the original card's footprint open while the real
// card is teleported away — otherwise a grid cell whose only child is gone
// collapses to 0 height, which (in a single-variation row) shrinks the host
// popover. Width tracks the cell via the grid, but height has no source
// without a child, so pin it from the cached rect.
const placeholderStyle = computed(() => {
  if (!showGhost.value || !ghostRect.value) return undefined;
  return { height: `${ghostRect.value.height}px` };
});

const { isRouteLeaving } = usePopoverAutoClose(containerRef, isOpen);
reportNestedPopoverOpen(isOpen);

// Belt-and-suspenders: even if pointer events were lost, route navigation and
// KeepAlive deactivation must never leave the ghost teleported to body.
onBeforeRouteLeave(() => endPress());
onDeactivated(() => endPress());

onUnmounted(() => {
  if (pressTimer) clearTimeout(pressTimer);
  detachWindowListeners();
});
</script>

<template>
  <!-- Grid-cell placeholder while the card is teleported away. -->
  <div v-show="showGhost" aria-hidden="true" :style="placeholderStyle" />

  <!-- Always rendered so the listeners + long-press detection are live from
       mount; the reka-ui Popover below is deferred until first interaction. -->
  <Teleport to="body" :disabled="!showGhost">
    <div
      ref="containerRef"
      class="relative transition-[transform,box-shadow] duration-300 ease-out"
      :class="isScaled ? 'scale-[1.05] shadow-lg z-[31]' : showGhost ? 'z-[31]' : ''"
      :style="ghostStyle"
      @pointerdown="onPointerDown"
      @pointerup="endPress"
      @pointercancel="endPress"
      @pointerleave="endPress"
      @click.capture="onClickCapture"
      @contextmenu.prevent
    >
      <slot />
    </div>
  </Teleport>

  <Popover v-if="hasInteracted" v-model:open="isOpen">
    <Teleport to="body">
      <!-- z-30 sits above the variations popover content (z-25) so when this
           popover is nested, the parent trick and sibling variations get
           blurred too. The standalone case (no outer popover) is unaffected.
           Backdrop swallows the outside-tap so it never bubbles to document —
           otherwise Reka's outside-click listener on the parent variations
           popover would also fire and close it. We stop pointerdown (Reka's
           dismiss trigger) but defer the actual close to click — closing on
           pointerdown would unmount the backdrop mid-gesture, so pointerup/
           click would land on whatever variation card is underneath and
           activate its RouterLink. -->
      <div
        v-if="isOpen"
        class="fixed -inset-[100px] z-30 bg-black/10 backdrop-blur-[1px]"
        @pointerdown.stop
        @click.stop="isOpen = false"
      />
    </Teleport>

    <PopoverContent
      v-if="!isRouteLeaving"
      side="bottom"
      :side-offset="8"
      :reference="virtualReference"
      position-strategy="absolute"
      class="!z-[35] p-3 w-auto"
    >
      <TrickStickFrequencySelector
        :trick-id="props.trickId"
        :trick-status="props.trickStatus"
        @change="onChange"
      />
    </PopoverContent>
  </Popover>
</template>
