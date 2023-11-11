<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

import messages from "../../i18n/index"

const i18n = useI18n({
  messages,
  useScope: "local"
})  

const {t} = i18n;

interface NavLink {
  tKey: string,
  to: string,
  icon: string,
}

const links: NavLink[] = [
  {tKey: "navbar.tricks", to: "/tricks", icon: "ic:baseline-auto-awesome"},
  {tKey: "navbar.combos", to:"/combos", icon: "ic:baseline-spoke"},
  {tKey: "navbar.glossary", to: "/glossary", icon: "ic:sharp-menu-book"},
  {tKey: "navbar.generator", to: "/generator", icon: "ic:sharp-factory"},
  {tKey: "navbar.more", to:"/more", icon: "ic:baseline-more-horiz"}
]

</script>


<template>
  <!-- Mobile -->
  <nav class="fixed bottom-0 inset-x-0 z-30 h-16 w-full bg-white border-t border-stone-400 visible md:collapse">
    <ul class="h-full grid justify-items-stretch items-center grid-cols-5 text-stone-700">
      <li v-for="entry in links">
         <RouterLink :to="entry.to" class="flex flex-col items-center rounded-lg px-2 py-2" active-class="text-green-500 group is-active">
           <Icon class="w-6 h-6" :icon="entry.icon"/>
           <div class="collapse group-[.is-active]:visible group-[.is-active]:md:collapse text-sm font-prose">
            {{ t(entry.tKey) }}
          </div>
         </RouterLink>
      </li>
    </ul>
  </nav>

</template>
