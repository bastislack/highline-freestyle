<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import {isDarkMode, setColorScheme, applyColorScheme} from "../util/colorScheme"
import { useI18n } from 'vue-i18n';
import { setNewLocale } from '../util/locale';

interface Props {
  type: "fixed" | "sticky"
}

const props = defineProps<Props>()

interface NavLink {
  label: string,
  to: string
}


const links: NavLink[] = [
  {label: "index", to: "/"},
  {label: "example", to:"/example"},
  {label: "about", to:"/about"},
]

const navClassList = computed( () => [
  "top-0", "z-30", "pointer-events-none", "w-full", props.type === "fixed" ? "fixed" : "sticky"
])


interface LocaleInfo {
  locale: "en" | "fr" | "es" | "de",
  icon: string
}

const LocaleInfos: LocaleInfo[] = [
  {
    locale: "en",
    icon: "flag:gb-4x3"
  },
  {
    locale: "fr",
    icon: "flag:fr-4x3"
  },
  {
    locale: "es",
    icon: "flag:es-4x3"
  },
  {
    locale: "de",
    icon: "flag:de-4x3"
  }
] 

const {locale} = useI18n()

const isMobileNavExpanded = ref(false)

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
  <nav :class="navClassList">
    <!-- Desktop -->
    <div class="hidden sm:flex flex-row items-center gap-3 bg-primary/90 backdrop-blur-sm p-2 pointer-events-auto dark:bg-slate-800">
      <!--       vvvvv  todo change to brand icon -->
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
    <!-- Mobile -->
    <div class="sm:hidden ">
      <nav class=" flex flex-row bg-primary/90 dark:bg-slate-800 backdrop-blur-sm items-center">
        <div class="flex-1">
          <button @click="isMobileNavExpanded=!isMobileNavExpanded" class="m-1 p-2 border border-white hover:bg-white/30 rounded-lg  pointer-events-auto">
            <Icon class="w-8 h-8 text-white" icon="mdi:menu" />
          </button>
        </div>
        <div class="flex-1 inline-flex justify-center ">
          <RouterLink to="/" class="m-1 p-1 hover:bg-white/30 rounded-full pointer-events-auto ">
            <!--       vvvvv  todo change to brand icon -->
            <Icon icon="tabler:error-404" class="w-12 h-12 text-white"/>
          </RouterLink>
        </div>
        <div class="flex-1"/>
        <div/>
      </nav>
      <div id="mobile-nav-container" :class="`hidden fixed top-0 overflow-hidden left-0 w-full h-full group/wrapper pointer-events-auto ${isMobileNavExpanded ? 'active' : ''}`">
        <div id="mobile-nav-background" @click="isMobileNavExpanded=false" class="h-full w-full bg-black/40 cursor-pointer group-[.active]/wrapper:block absolute hidden "/>
        <div id="mobile-nav-content" class="absolute w-full pointer-events-none -translate-x-full group-[.active]/wrapper:translate-x-0 transition-all duration-200 ">
          <div class="mt-5 flex flex-col bg-white p-4 mr-12 pointer-events-auto overflow-y-scroll h-screen rounded-r-lg pb-24 dark:bg-slate-900 ">
            <div class="flex flex-row items-center justify-between  mb-3">
              <h2 class="text-2xl font-heading dark:text-white">Navigation Bar</h2>
              <button @click="isMobileNavExpanded=false" class="p-4 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full dark:text-white">
                <Icon class="w-6 h-6" icon="ic:outline-close"/>
              </button>
            </div>

            <div class=" flex flex-col gap-1 text-black font-prose">
              <RouterLink v-for="route of links" :to="route.to" class="p-4 pl-8 border border-primary dark:border-white/40 dark:hover:border-transparent hover:border-transparent grid items-stretch rounded-lg  group transition-all duration-150 hover:bg-primary">
                <div class="inline-flex flex-row items-center">
                  <h2 class="text-primary dark:text-white group-hover:text-white text-xl sm:text-3xl font-black font-heading tracking-tight">{{ route.label }}</h2>
                  <span class="flex-1"/>
                  <Icon class="w-6 sm:w-12 dark:text-white text-primary group-hover:text-white -translate-x-2 group-hover:translate-x-0 transition-all duration-150"  icon="ic:twotone-chevron-right"/>
                </div>
              </RouterLink>
            </div>

            <button @click="toggleDarkmode()" class="darkmode-switch flex flex-row p-4 pl-8 mt-5 items-center justify-between border border-primary dark:border-white/40 dark:hover:border-transparent hover:border-transparent rounded-lg  group transition-all duration-150 hover:bg-primary">
              <div>
                <span class="text-primary dark:text-white block dark:hidden group-hover:text-white text-xl sm:text-3xl font-black font-heading tracking-tight">{DarkLightModeI18n[locale].dark}</span>
                <span class="text-primary dark:text-white hidden dark:block group-hover:text-white text-xl sm:text-3xl font-black font-heading tracking-tight">{DarkLightModeI18n[locale].light}</span>
              </div>
              <div>
                <Icon icon="material-symbols:wb-sunny" class=" hidden dark:block text-primary dark:text-white group-hover:text-white w-8 h-8" />
                <Icon icon="material-symbols:dark-mode-rounded" class="block dark:hidden text-primary dark:text-white group-hover:text-white w-8 h-8" />
              </div>
            </button>

            <div class="mt-3 border border-primary dark:border-white/40 rounded-lg">
              <div class=" flex flex-col divide-y divide-primary dark:divide-white/40">
                <button v-for="locale of LocaleInfos" @click="updateLocale(locale.locale)" class="p-4 duration-150 hover:bg-primary hover:text-white text-primary dark:text-white text-xl  first:rounded-t-md last:rounded-b-md flex flex-row items-center gap-3">
                  <Icon :icon="locale.icon" class="w-8 h-8" /><span>{{ locale.locale }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </nav>

</template>

<style>
#mobile-nav-container.active {
  display: block
}
</style>
