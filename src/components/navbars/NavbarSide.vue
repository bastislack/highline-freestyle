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
  translationKey: string,
  to: string,
  icon: string
}

const links: NavLink[] = [
  {translationKey: "navbar.tricks", to: "/tricks", icon: "ic:baseline-auto-awesome"},
  {translationKey: "navbar.combos", to:"/combos", icon: "ic:baseline-spoke"},
  {translationKey: "navbar.glossary", to: "/glossary", icon: "ic:sharp-menu-book"},
  {translationKey: "navbar.generator", to: "/generator", icon: "ic:sharp-factory"},
  {translationKey: "navbar.more", to:"/about", icon: "ic:baseline-more-horiz"}
]

</script>


<template>
  <!-- Desktop -->
  <nav class="z-30 fixed left-0">
    <div class="h-screen w-56 bg-white m-0 border-r border-stone-300 shadow-sm">
      <div class="h-4"></div>
      <div class="px-7 py-6 my-0 font-black">Logo</div>
      <div class="h-8"></div>
      <ul class="flex flex-col gap-1 text-stone-700 font-prose">
        <li v-for="entry in links">
          <RouterLink :to="entry.to" class="hover:bg-stone-100 px-7 py-2 flex flex-row gap-4" active-class="text-green-500 border-l-4 border-green-500 bg-stone-100 hover:bg-stone-50">
            <Icon class="w-6 h-6 m-0 p-0" :icon="entry.icon"/>
            <div class="h-6 m-0 p-0 text-lg flex flex-col justify-center items-center">
              <span>{{ t(entry.translationKey) }}</span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>

</template>
