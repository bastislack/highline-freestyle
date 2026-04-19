import { onMounted, onUnmounted, ref } from 'vue';

export function useMediaQuery(query: string) {
  const matches = ref(false);
  let mq: MediaQueryList | null = null;

  function onChange(e: MediaQueryListEvent) {
    matches.value = e.matches;
  }

  onMounted(() => {
    mq = window.matchMedia(query);
    matches.value = mq.matches;
    mq.addEventListener('change', onChange);
  });
  onUnmounted(() => {
    mq?.removeEventListener('change', onChange);
    mq = null;
  });

  return matches;
}
