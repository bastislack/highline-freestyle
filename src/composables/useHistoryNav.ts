import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { useRoute, useRouter, type Router } from 'vue-router';

type State = { pathStack: Ref<string[]> };
const stateByRouter = new WeakMap<Router, State>();

function getOrCreateState(router: Router): State {
  const existing = stateByRouter.get(router);
  if (existing) return existing;

  const initialPath =
    router.currentRoute.value.matched.length > 0 ? router.currentRoute.value.path : null;

  const state: State = { pathStack: ref<string[]>(initialPath ? [initialPath] : []) };
  stateByRouter.set(router, state);

  let navType: 'push' | 'replace' | 'back' = 'push';

  const originalReplace = router.replace.bind(router);
  router.replace = (...args: Parameters<Router['replace']>) => {
    navType = 'replace';
    return originalReplace(...args);
  };

  const originalBack = router.back.bind(router);
  router.back = () => {
    navType = 'back';
    return originalBack();
  };

  router.afterEach((to, from, failure) => {
    if (failure) {
      navType = 'push';
      return;
    }
    const stack = state.pathStack.value;
    if (from.matched.length === 0) {
      state.pathStack.value = [to.path];
    } else if (navType === 'back') {
      state.pathStack.value = stack.slice(0, -1);
    } else if (navType === 'replace') {
      state.pathStack.value = [...stack.slice(0, -1), to.path];
    } else {
      state.pathStack.value = [...stack, to.path];
    }
    navType = 'push';
  });

  return state;
}

export function useHistoryNav(homePath: MaybeRefOrGetter<string>) {
  const route = useRoute();
  const router = useRouter();
  const { pathStack } = getOrCreateState(router);

  const home = computed(() => toValue(homePath));
  const isHome = computed(() => route.path === home.value);
  const showBack = computed(() => !isHome.value && pathStack.value.length > 1);
  const showHome = computed(() => {
    if (isHome.value) return false;
    if (pathStack.value.length < 2) return true;
    return pathStack.value.at(-2) !== home.value;
  });

  function goBack() {
    router.back();
  }
  function goHome() {
    router.replace(home.value);
  }

  return { isHome, showBack, showHome, goBack, goHome };
}
