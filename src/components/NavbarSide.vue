<script lang="ts" setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import {isDarkMode, setColorScheme, applyColorScheme} from "../util/colorScheme"
import { useI18n } from 'vue-i18n';
import { setNewLocale } from '../util/locale';

interface NavLink {
  label: string,
  to: string,
  icon: string
}

const links: NavLink[] = [
  {label: "Tricks", to: "/", icon: "ic:baseline-auto-awesome"},
  {label: "Combos", to:"/combos", icon: "ic:baseline-spoke"},
  {label: "Glossary", to: "/glossary", icon: "ic:sharp-menu-book"},
  {label: "Generator", to: "/generator", icon: "ic:sharp-factory"},
  {label: "Settings", to:"/settings", icon: "ic:round-settings"}
]

interface LocaleInfo {
  locale: "en" | "fr" | "es" | "de",
  icon: string
}

const {locale} = useI18n()

function updateLocale(newLocale: LocaleInfo["locale"]) {
  locale.value = newLocale
  setNewLocale(newLocale)
}

function toggleDarkmode() {
  const isDark = isDarkMode();
  setColorScheme(!isDark ? "dark" : "light")
  applyColorScheme()
}


</script>


<template>
  <!-- Desktop -->
  <nav class="z-30 fixed left-0">
    <div class="h-screen w-56 bg-white m-0 border-r border-stone-500">
      <div class="h-4"></div>
      <div class="p-6 my-0 font-black">Here is the logo</div>
      <div class="h-8"></div>
      <ul class="flex flex-col gap-1 text-stone-700 font-prose">
        <li v-for="entry in links">
          <RouterLink :to="entry.to" class="hover:bg-green-50 px-7 py-2 flex flex-row gap-4">
            <Icon class="w-6 h-6 m-0 p-0" :icon="entry.icon"/>
            <div class="h-6 m-0 p-0 text-lg flex flex-col justify-center items-center">
              <span>{{entry.label}}</span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
    <!--
    <div class="hidden sm:flex flex-row items-center gap-3 bg-primary/90 backdrop-blur-sm p-2 pointer-events-auto dark:bg-slate-800">
      <Icon icon="tabler:error-404" class="w-8 h-8 text-white"/>
      <RouterLink to="/" class="md:text-2xl hidden md:block text-white font-heading hover:underline">Highline Freestyle</RouterLink>
      <div class="flex-1"/>
      <ul class=" inline-flex flex-row gap-1 text-white font-prose">
        <li v-for="entry in links">
          <RouterLink :to="entry.to" class="rounded-lg md:text-xl hover:bg-black/20 p-3">{{entry.label}}</RouterLink>
        </li>
      </ul>
      <div class="h-5 w-[1px] bg-white/30"/>
      <button class="darkmode-switch hover:bg-black/20 p-1 rounded-full" @click="toggleDarkmode()">
        <Icon icon="material-symbols:wb-sunny" class=" hidden dark:block text-white w-8 h-8" />
        <Icon icon="material-symbols:dark-mode-rounded" class="block dark:hidden text-white w-8 h-8" />
      </button>
      <div class="group relative">
        <button class=" hover:bg-black/20 p-1 rounded-full group/i18n">
          <Icon icon="material-symbols:translate" class=" text-white w-8 h-8" />
        </button>
        <div class="hidden group-hover:block absolute top-full right-0 pl-20 pb-20 pt-5 -mt-5 ">
          <div class="mt-3 border rounded-lg dark:bg-slate-700 bg-white dark:border-slate-800 dark:text-white">
            <div class=" inline-flex flex-col divide-y dark:divide-slate-800">
                <button @click="updateLocale(locale.locale)" v-for="locale in LocaleInfos" class="p-4 hover:bg-black/10 flex flex-row items-center gap-3">
                  <Icon class="w-8 h-8" :icon="locale.icon"/>
                  <span>{{ locale.locale }}</span>
                </button>
            </div>
          </div>
        </div>
      </div>
      </div>
  -->
  </nav>

</template>

<style>
#mobile-nav-container.active {
  display: block
}
</style>
