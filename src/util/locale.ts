import { z } from "zod";

export const LocalesZod = z.enum([
  "en", "fr", "es", "de",
])

/**
 * This causes the setting to persist. Next time user loads the website
 * it will use their preferred locale.
 */
export function setNewLocale(locale: z.infer<typeof LocalesZod> ) {
  window.localStorage.setItem("PREFERRED_LOCALE", LocalesZod.parse(locale))
}

export function getPreferredLocale() {
  return "de"
  const locale = LocalesZod.safeParse(window.localStorage.getItem("PREFERRED_LOCALE") ?? "en")
  if(!locale.success) {
    console.error("Found unknown locale in localStorage. Falling back to 'en'.")
    setNewLocale("en")
    return getPreferredLocale()
  }
  return locale.data
}