<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { setNewLocale } from '../util/locale';

interface NavLink {
  label: string,
  to: string,
  icon: string,
  enabled: boolean
}

const links: NavLink[] = [
  {label: "Tricks", to: "/", icon: "ic:baseline-auto-awesome", enabled: true},
  {label: "Combos", to:"/combos", icon: "ic:baseline-spoke", enabled: false},
  {label: "Glossary", to: "/glossary", icon: "ic:sharp-menu-book", enabled: false},
  {label: "Generator", to: "/generator", icon: "ic:sharp-factory", enabled: false},
  {label: "Settings", to:"/settings", icon: "ic:round-settings", enabled: false}
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

</script>


<template>
  <!-- Mobile -->
  <nav class="fixed bottom-0 inset-x-0 z-30 h-16 w-full bg-white border-t border-stone-500">
    <ul class="h-full grid justify-items-stretch items-center grid-cols-5 text-stone-700">
      <li v-for="entry in links">
         <RouterLink :to="entry.to" class="flex flex-col items-center rounded-lg hover:bg-green-50 px-2 py-2" active-class="text-green-600 group is-active">
           <Icon class="w-6 h-6" :icon="entry.icon"/>
           <div class="collapse group-[.is-active]:visible text-xs font-prose">{{ entry.label }}</div>
         </RouterLink>
      </li>
    </ul>
  </nav>

</template>
