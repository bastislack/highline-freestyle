import {i18n} from "@lingui/core";
import {detect, fromStorage, fromNavigator} from "@lingui/detect-locale";
import {en, es} from "make-plural/plurals";

export const supportedLocales = ["en", "es"];
export const defaultLocale = supportedLocales[0];

const LOCAL_STORAGE_KEY = "lang";

i18n.loadLocaleData({
  en: {plurals: en},
  es: {plurals: es},
});

function getDetectedLocale() {
  return detect(fromStorage(LOCAL_STORAGE_KEY), fromNavigator(), () => defaultLocale);
}

export function getLocale() {
  const detectedLocale = getDetectedLocale();
  if (detectedLocale && supportedLocales.includes(defaultLocale)) {
    return detectedLocale;
  }
  return defaultLocale;
}

export async function setAppLanguage(locale: string): Promise<void> {
  // Load message keys with lingui
  const {messages} = await import(`../locales/${locale}.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  window.localStorage.setItem(LOCAL_STORAGE_KEY, locale); // TODO: Move to special local storage accessor?
}
