import { onUnmounted, ref, watch, type Ref } from 'vue';

export function useSymmetricSlots(
  containerRef: Ref<HTMLElement | null>,
  leftRef: Ref<HTMLElement | null>,
  rightRef: Ref<HTMLElement | null>,
  enabled: Ref<boolean>
) {
  const sideWidthPx = ref(0);
  const containerHeightPx = ref(0);
  let observer: ResizeObserver | null = null;

  function measure() {
    const leftW = leftRef.value?.offsetWidth ?? 0;
    const rightW = rightRef.value?.offsetWidth ?? 0;
    sideWidthPx.value = Math.max(leftW, rightW);
    containerHeightPx.value = containerRef.value?.offsetHeight ?? 0;
  }

  function attach() {
    if (observer) return;
    observer = new ResizeObserver(measure);
    if (containerRef.value) observer.observe(containerRef.value);
    if (leftRef.value) observer.observe(leftRef.value);
    if (rightRef.value) observer.observe(rightRef.value);
    measure();
  }

  function detach() {
    observer?.disconnect();
    observer = null;
    sideWidthPx.value = 0;
    containerHeightPx.value = 0;
  }

  watch(
    enabled,
    (on) => {
      if (on) attach();
      else detach();
    },
    { immediate: true, flush: 'post' }
  );

  onUnmounted(detach);

  return { sideWidthPx, containerHeightPx };
}
