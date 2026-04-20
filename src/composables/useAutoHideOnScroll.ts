import { onUnmounted, ref, watch, type Ref } from 'vue';

export function useAutoHideOnScroll(maxHidePx: Ref<number>, enabled: Ref<boolean>) {
  const offsetY = ref(0);
  let lastScrollY = 0;
  let attached = false;

  function onScroll() {
    const currentY = window.scrollY;
    if (currentY <= 0) {
      offsetY.value = 0;
      lastScrollY = 0;
      return;
    }
    const delta = currentY - lastScrollY;
    offsetY.value = Math.max(-maxHidePx.value, Math.min(0, offsetY.value - delta));
    lastScrollY = currentY;
  }

  function attach() {
    if (attached) return;
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    attached = true;
  }

  function detach() {
    if (!attached) return;
    window.removeEventListener('scroll', onScroll);
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

  onUnmounted(detach);

  return { offsetY };
}
