import { ref } from 'vue';

const STORAGE_KEY = 'SHOW_VARIATIONS_AS_TRICKS';

const showVariationsAsTricks = ref<boolean>(
  localStorage.getItem(STORAGE_KEY) === 'true'
);

export function getShowVariationsAsTricks(): boolean {
  return showVariationsAsTricks.value;
}

export function setShowVariationsAsTricks(value: boolean) {
  showVariationsAsTricks.value = value;
  if (value) {
    localStorage.setItem(STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
