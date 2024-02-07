<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

import messages from '../../i18n/navbar';
import DropdownMenuGroup from '../ui/dropdown-menu/DropdownMenuGroup.vue';
import { setNewLocale } from '@/util/locale';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

interface LocaleInfo {
  locale: 'en' | 'fr' | 'es';
  name: string;
}

const LocaleInfos: LocaleInfo[] = [
  {
    locale: 'en',
    name: 'English',
  },
  {
    locale: 'es',
    name: 'Español',
  },
  {
    locale: 'fr',
    name: 'Français',
  },
];

const { locale } = useI18n();

function updateLocale(newLocale: LocaleInfo['locale']) {
  locale.value = newLocale;
  setNewLocale(newLocale);
}

interface NavLink {
  translationKey: string;
  to: string;
  icon: string;
}

const links: NavLink[] = [
  { translationKey: 'tricks', to: '/tricks', icon: 'ic:baseline-auto-awesome' },
  { translationKey: 'combos', to: '/combos', icon: 'ic:baseline-spoke' },
  { translationKey: 'glossary', to: '/glossary', icon: 'ic:sharp-menu-book' },
];

const dropdownLinks: NavLink[] = [
  { translationKey: 'about', to: '/about', icon: 'ic:outline-info' },
  { translationKey: 'settings', to: '/settings', icon: 'ic:round-settings' },
];
</script>

<template>
  <!-- Mobile -->
  <nav
    class="fixed bottom-0 inset-x-0 z-30 h-16 w-full bg-white border-t border-stone-300 shadow-sm px-2"
  >
    <ul class="h-full grid justify-items-stretch items-center grid-cols-4 text-gray-700">
      <li v-for="entry in links" v-bind:key="entry.translationKey">
        <RouterLink
          :to="entry.to"
          class="bottomnav-column p-2 duration-200 group items-center"
          active-class="text-primary group is-active bg-primary-50 py-1 rounded-lg"
        >
          <div class="flex justify-center">
            <Icon class="w-6 h-6" :icon="entry.icon" />
          </div>
          <span
            class="opacity-0 group-[.is-active]:opacity-100 text-sm duration-150 font-prose overflow-hidden flex justify-center pointer-events-none"
          >
            {{ t(entry.translationKey) }}
          </span>
        </RouterLink>
      </li>
      <DropdownMenu>
        <DropdownMenuTrigger class="flex justify-center p-2 data-[state=open]:text-primary">
          <Icon class="w-6 h-6" icon="ic:baseline-more-horiz" />
        </DropdownMenuTrigger>
        <DropdownMenuContent class="mb-3 mr-1 w-36 text-lg lg:collapse">
          <DropdownMenuGroup>
            <DropdownMenuItem
              v-for="lang in LocaleInfos"
              v-bind:key="lang.locale"
              @click="updateLocale(lang.locale)"
              class="text-base"
            >
              <Icon v-if="lang.locale == locale" class="h-5 w-5 mr-3" icon="ic:round-check" />
              <div v-else class="w-5 mr-3"></div>
              {{ lang.name }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-for="entry in dropdownLinks"
            :key="entry.translationKey"
            class="text-base"
          >
            <RouterLink
              :to="entry.to"
              class="flex flex-row items-center w-full rounded"
              active-class="text-primary"
            >
              <Icon class="h-5 w-5 mr-3" :icon="entry.icon" />
              {{ t(entry.translationKey) }}
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ul>
  </nav>
</template>

<style lang="scss">
.bottomnav-column {
  display: grid;
  grid-template-rows: min-content 0fr;
  overflow: hidden;
  transition: all 100ms;
  &.is-active {
    grid-template-rows: min-content 1fr;
  }
}
</style>
