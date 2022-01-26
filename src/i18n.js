import { i18n } from '@lingui/core';
import { detect, fromUrl, fromStorage, fromNavigator } from '@lingui/detect-locale';

export const defaultLocale = "en";
export const supportedLocales = [ "en", "es"];

const LOCAL_STORAGE_KEY = 'lang';

// returns locale
export function getLocale() {
  const detectedLocale = detect(
    fromStorage(LOCAL_STORAGE_KEY),
    fromNavigator(), // from system settings
    () => defaultLocale,
  );

  return supportedLocales.includes(detectedLocale) ? detectedLocale : defaultLocale;
}

export async function setAppLanguage(locale) {
  const { messages } = await import(`./locales/${locale}/messages`)
  i18n.load(locale, messages)
  i18n.activate(locale)
  window.localStorage.setItem(LOCAL_STORAGE_KEY, locale);
}
