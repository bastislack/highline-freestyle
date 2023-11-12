<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

import messages from "../../i18n/navbar/navbar"

const i18n = useI18n({
  messages,
  useScope: "local"
})  

const {t} = i18n;

interface NavLink {
  translationKey: string,
  to: string,
  icon: string,
}

const links: NavLink[] = [
  {translationKey: "tricks", to: "/tricks", icon: "ic:baseline-auto-awesome"},
  {translationKey: "combos", to:"/combos", icon: "ic:baseline-spoke"},
  {translationKey: "glossary", to: "/glossary", icon: "ic:sharp-menu-book"},
  {translationKey: "generator", to: "/generator", icon: "ic:sharp-factory"},
  {translationKey: "more", to:"/about", icon: "ic:baseline-more-horiz"}
]

</script>


<template>
  <!-- Mobile -->
  <nav class="fixed bottom-0 inset-x-0 z-30 h-16 w-full bg-white border-t border-stone-300 shadow-sm">
    <ul class="h-full grid justify-items-stretch items-center grid-cols-5 text-stone-700">
      <li v-for="entry in links">
         <RouterLink :to="entry.to" class="flex flex-col items-center p-2" active-class="text-green-500 group is-active bg-stone-100 py-1 rounded-lg">
           <Icon class="w-6 h-6" :icon="entry.icon"/>
           <div class="collapse group-[.is-active]:visible text-sm font-prose">
            {{ t(entry.translationKey) }}
          </div>
         </RouterLink>
      </li>
    </ul>
  </nav>

</template>
