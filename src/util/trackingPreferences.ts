export type EmbedSite = 'YOUTUBE' | 'INSTAGRAM';

export function isEmbedAllowed(site: EmbedSite): boolean {
  const key = `${site}_EMBED_ALLOWED`;
  return localStorage.getItem(key) === 'true';
}

export function setEmbedPreference(site: EmbedSite, isAllowed: boolean) {
  const key = `${site}_EMBED_ALLOWED`;
  if (isAllowed) {
    localStorage.setItem(key, 'true');
  } else {
    localStorage.removeItem(key);
  }
}
