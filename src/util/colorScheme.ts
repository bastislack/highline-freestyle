import { z } from "zod";

const ColorSetting = z.enum(["dark", "light", "system"])
export type ColorSetting = z.infer<typeof ColorSetting>

const LocalStorageKey = "COLOR_SCHEME"

export function isDarkMode() {
  // Stolen from https://tailwindcss.com/docs/dark-mode
  if(localStorage[LocalStorageKey]) {
    return localStorage[LocalStorageKey] === "dark"
  }
  return  window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function setColorScheme(scheme: ColorSetting) {
  if(scheme === "system") {
    window.localStorage.removeItem(LocalStorageKey)
  } else {
    window.localStorage[LocalStorageKey] = scheme
  }
}

export function applyColorScheme() {
  const isDark = isDarkMode();
  const htmlNode = document.getElementsByTagName("html")[0]! // Every Doc has a HTML Element
  if(htmlNode.classList.contains("dark") !== isDark) {
    htmlNode.classList.toggle("dark")
  }
}
