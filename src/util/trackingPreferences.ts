import { ref } from 'vue';

export type EmbedSite = 'YOUTUBE' | 'INSTAGRAM';

// This map is needed to make the embed preferences reactive, since the
// localStorage is not reactive by itself.
const embedPreferences = ref<Map<EmbedSite, boolean>>(
  new Map([
    ['YOUTUBE', localStorage.getItem('YOUTUBE_EMBED_ALLOWED') === 'true'],
    ['INSTAGRAM', localStorage.getItem('INSTAGRAM_EMBED_ALLOWED') === 'true'],
  ])
);

export function isEmbedAllowed(site: EmbedSite): boolean {
  return embedPreferences.value.get(site) === true;
}

export function setEmbedPreference(site: EmbedSite, isAllowed: boolean) {
  const key = `${site}_EMBED_ALLOWED`;
  if (isAllowed) {
    embedPreferences.value.set(site, true);
    localStorage.setItem(key, 'true');
  } else {
    embedPreferences.value.delete(site);
    localStorage.removeItem(key);
  }
}
