import { i18n } from '@lingui/core';
import { detect, fromStorage, fromNavigator } from '@lingui/detect-locale';
import { en, es } from 'make-plural/plurals'

export const defaultLocale = "en";
export const supportedLocales = ["en", "es"];

const LOCAL_STORAGE_KEY = 'lang';

i18n.loadLocaleData({
  en: { plurals: en },
  es: { plurals: es },
})

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
  const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.po`)
  i18n.load(locale, messages)
  i18n.activate(locale)
  window.localStorage.setItem(LOCAL_STORAGE_KEY, locale);
}
