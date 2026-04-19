import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { useRoute, useRouter, type Router } from 'vue-router';

type State = { prevPath: Ref<string | null>; navCount: Ref<number> };
const stateByRouter = new WeakMap<Router, State>();

function getOrCreateState(router: Router): State {
  const existing = stateByRouter.get(router);
  if (existing) return existing;
  const state: State = { prevPath: ref<string | null>(null), navCount: ref(0) };
  stateByRouter.set(router, state);
  router.afterEach((_to, from) => {
    if (from.matched.length > 0) {
      state.prevPath.value = from.path;
      state.navCount.value += 1;
    }
  });
  return state;
}

export function useHistoryNav(homePath: MaybeRefOrGetter<string>) {
  const route = useRoute();
  const router = useRouter();
  const { prevPath, navCount } = getOrCreateState(router);

  const home = computed(() => toValue(homePath));
  const isHome = computed(() => route.path === home.value);
  const showBack = computed(() => !isHome.value && navCount.value > 0);
  const showHome = computed(() => !isHome.value && prevPath.value !== home.value);

  function goBack() {
    router.back();
  }
  function goHome() {
    router.replace(home.value);
  }

  return { isHome, showBack, showHome, goBack, goHome };
}
