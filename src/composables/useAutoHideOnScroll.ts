import { onActivated, onUnmounted, ref, watch, type Ref } from 'vue';

export function useAutoHideOnScroll(maxHidePx: Ref<number>, enabled: Ref<boolean>) {
  const offsetY = ref(0);
  let lastScrollY = 0;
  let attached = false;
  // Gate auto-hide on real user input. Programmatic scrolls (e.g. scroll
  // restoration after KeepAlive reactivation) shouldn't drive the hide
  // animation — otherwise the header snaps shut the moment the user navigates
  // back to a mid-list position.
  let respondsToScroll = true;

  function onScroll() {
    const currentY = window.scrollY;
    if (!respondsToScroll) {
      lastScrollY = currentY;
      return;
    }
    if (currentY <= 0) {
      offsetY.value = 0;
      lastScrollY = 0;
      return;
    }
    const delta = currentY - lastScrollY;
    offsetY.value = Math.max(-maxHidePx.value, Math.min(0, offsetY.value - delta));
    lastScrollY = currentY;
  }

  function onUserIntent() {
    respondsToScroll = true;
  }

  function attach() {
    if (attached) return;
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onUserIntent, { passive: true });
    window.addEventListener('touchstart', onUserIntent, { passive: true });
    window.addEventListener('keydown', onUserIntent);
    attached = true;
  }

  function detach() {
    if (!attached) return;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', onUserIntent);
    window.removeEventListener('touchstart', onUserIntent);
    window.removeEventListener('keydown', onUserIntent);
    offsetY.value = 0;
    attached = false;
  }

  watch(
    enabled,
    (on) => {
      if (on) attach();
      else detach();
    },
    { immediate: true }
  );

  // Show the header on every back-nav into a kept-alive view; auto-hide
  // re-engages on the next user-driven scroll. First activation == initial
  // mount, so leave existing first-load behavior untouched.
  let isFirstActivation = true;
  onActivated(() => {
    if (isFirstActivation) {
      isFirstActivation = false;
      return;
    }
    offsetY.value = 0;
    lastScrollY = window.scrollY;
    respondsToScroll = false;
  });

  onUnmounted(detach);

  return { offsetY };
}
