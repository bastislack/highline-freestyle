// Auto-close a popover when:
//   - the trigger element scrolls out of view (IntersectionObserver), or
//   - the route is leaving.
//
// Returns `isRouteLeaving` so callers can `v-if`-gate their PopoverContent.
// Setting `isOpen = false` alone isn't enough during navigation: PopoverContent
// is teleported to <body> via PopoverPortal, and the design system's close
// animation (fade-out + zoom-out) keeps it mounted for ~150ms. Meanwhile the
// host route moves into KeepAlive's offscreen storage, the trigger's rect
// collapses to (0,0), and Floating UI repositions the still-visible popover
// to the top of the viewport before it finishes animating out. Gating
// PopoverContent behind a v-if lets Vue unmount the teleport immediately,
// skipping the exit animation entirely.

import {
  inject,
  onActivated,
  onUnmounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

export function usePopoverAutoClose(
  targetRef: Ref<HTMLElement | undefined>,
  isOpen: Ref<boolean>
): { isRouteLeaving: Ref<boolean> } {
  let observer: IntersectionObserver | null = null;

  watch(isOpen, (open) => {
    observer?.disconnect();
    observer = null;
    if (open && targetRef.value) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) isOpen.value = false;
        },
        { threshold: 0 }
      );
      observer.observe(targetRef.value);
    }
  });

  onUnmounted(() => observer?.disconnect());

  const isRouteLeaving = ref(false);
  onBeforeRouteLeave(() => {
    isOpen.value = false;
    isRouteLeaving.value = true;
  });
  onActivated(() => {
    isRouteLeaving.value = false;
  });

  return { isRouteLeaving };
}

// Coordinates backdrops between an outer popover and any nested popover.
// Both popovers render their own `backdrop-blur` overlay; stacking two of
// them visibly doubles the blur and darkening. Outer popovers expose a flag;
// nested popovers report their open state into it; outer popover hides its
// own backdrop while the flag is true.
const NESTED_POPOVER_OPEN_KEY: InjectionKey<Ref<boolean>> = Symbol('nestedPopoverOpen');

export function provideNestedPopoverFlag(): Ref<boolean> {
  const flag = ref(false);
  provide(NESTED_POPOVER_OPEN_KEY, flag);
  return flag;
}

export function reportNestedPopoverOpen(isOpen: Ref<boolean>): void {
  const parentFlag = inject(NESTED_POPOVER_OPEN_KEY, null);
  if (!parentFlag) return;
  watch(isOpen, (open) => {
    parentFlag.value = open;
  });
}
