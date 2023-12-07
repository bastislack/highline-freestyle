<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import messages from '../../i18n/navbar';
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
</script>

<template>
  <!-- Desktop -->
  <nav
    class="fixed z-30 left-0 h-screen w-56 m-0 border-r shadow-sm bg-background border-gray-300 flex flex-col justify-between overflow-auto"
  >
    <!-- Top section (Logo and most frequent routes)-->
    <div>
      <div class="h-4"></div>
      <div class="px-7 py-6 my-0 font-black">Logo</div>
      <div class="h-8"></div>
      <ul class="flex flex-col gap-1 text-gray-800 font-prose">
        <li v-for="entry in links" v-bind:key="entry.translationKey">
          <RouterLink
            :to="entry.to"
            class="hover:bg-primary-50 px-7 py-2 flex flex-row gap-4"
            active-class="text-primary border-l-4 border-primary bg-primary-50"
          >
            <Icon class="w-6 h-6 m-0 p-0" :icon="entry.icon" />
            <div class="h-6 m-0 p-0 text-lg flex flex-col justify-center items-center">
              <span>{{ t(entry.translationKey) }}</span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- Bottom section (Language selection and non frequent routes)-->
    <div class="h-fit my-3 px-2 text-gray-800">
      <Separator orientation="horizontal" class="mb-3" />
      <Button
        v-for="lang in LocaleInfos"
        v-bind:key="lang.locale"
        @click="updateLocale(lang.locale)"
        variant="ghost"
        size="sm"
        class="w-full py-0"
      >
        <div class="flex w-full">
          <!--Added to get around centering of button component-->
          <Icon v-if="lang.locale == locale" class="h-5 w-5 mr-3" icon="ic:round-check" />
          <div v-else class="w-5 mr-3"></div>
          {{ lang.name }}
        </div>
      </Button>
      <Separator orientation="horizontal" class="my-3" />
      <Button size="sm" variant="ghost" as-child class="w-full">
        <RouterLink to="/about">
          <div class="flex w-full">
            <Icon class="h-5 w-5 mr-3" icon="ic:outline-info" />
            {{ t('about') }}
          </div>
        </RouterLink>
      </Button>
    </div>
  </nav>
</template>
