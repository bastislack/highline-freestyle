<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Header from '@/components/stickable/Header.vue';
import Section from '@/components/ui/section/Section.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import { Button } from '@/components/ui/button';
import messages from '@/i18n/settings';
import messagesNavbar from '@/i18n/navbar';
import { i18nMerge } from '@/i18n/i18nmerge';
import { isEmbedAllowed, setEmbedPreference } from '@/util/trackingPreferences';
import {
  getIncludedStatuses,
  setIncludedStatuses,
  getShowFavoritesAtTop,
  setShowFavoritesAtTop,
  getPreferredName,
  setPreferredName,
} from '@/util/trickListPreferences';
import type { StickableStatus } from '@/lib/utils';
import { setNewLocale, LocaleInfos, type Locales } from '@/util/locale';
import { Icon } from '@iconify/vue/dist/iconify.js';

const i18n = useI18n({
  messages: i18nMerge(messages, messagesNavbar),
  useScope: 'local',
});
const { t } = i18n;
const { locale } = useI18n();

function updateLocale(newLocale: Locales) {
  locale.value = newLocale;
  setNewLocale(newLocale);
}

function toggleIncludedStatus(status: StickableStatus) {
  const current = getIncludedStatuses();
  if (current.includes(status)) {
    const updated = current.filter((s) => s !== status);
    if (updated.length > 0) setIncludedStatuses(updated);
  } else {
    setIncludedStatuses([...current, status]);
  }
}
</script>

<template>
  <DefaultLayout>
    <Header>{{ t('heading-settings') }}</Header>

    <Section>
      <div class="text-2xl hidden lg:block">{{ t('heading-settings') }}</div>
      <Separator class="my-2 hidden lg:block" />

      <!-- Language selection (mobile only) -->
      <div class="lg:hidden">
        <div class="flex flex-row gap-2 align-middle">
          <Icon icon="ic:round-translate" class="w-6 h-6" />
          <div class="text-xl font-medium">{{ t('language') }}</div>
        </div>
        <div class="flex flex-row flex-wrap gap-1 mt-2 mb-2">
          <Button
            v-for="lang in LocaleInfos"
            :key="lang.locale"
            @click="updateLocale(lang.locale)"
            :variant="lang.locale === locale ? 'default' : 'secondary'"
            size="sm"
          >
            {{ lang.name }}
          </Button>
        </div>
        <Separator class="my-3" />
      </div>

      <div class="flex flex-row gap-2 align-middle">
        <Icon icon="ic:round-list" class="w-6 h-6" />
        <div class="text-xl font-medium">{{ t('trickList.heading') }}</div>
      </div>
      <div class="flex flex-col gap-2 mb-2">
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-col gap-0">
            <div class="font-medium">{{ t('trickList.favoritesAtTop.name') }}</div>
            <div class="text-muted-foreground text-sm">
              {{ t('trickList.favoritesAtTop.description') }}
            </div>
          </div>
          <Switch
            @update:model-value="(pref: boolean) => setShowFavoritesAtTop(pref)"
            :model-value="getShowFavoritesAtTop()"
          />
        </div>
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-col gap-0">
            <div class="font-medium">{{ t('trickList.preferredName.name') }}</div>
            <div class="text-muted-foreground text-sm">
              {{ t('trickList.preferredName.description') }}
            </div>
          </div>
          <Switch
            @update:model-value="
              (pref: boolean) => setPreferredName(pref ? 'technicalName' : 'alias')
            "
            :model-value="getPreferredName() === 'technicalName'"
          />
        </div>
        <div class="flex flex-col gap-1">
          <div class="font-medium">{{ t('trickList.includedStatuses.name') }}</div>
          <div class="flex flex-row flex-wrap gap-1">
            <Button
              v-for="status in ['official', 'userDefined', 'archived'] as StickableStatus[]"
              :key="status"
              @click="toggleIncludedStatus(status)"
              :variant="getIncludedStatuses().includes(status) ? 'default' : 'secondary'"
              size="sm"
            >
              {{ t(`trickList.includedStatuses.${status}`) }}
            </Button>
          </div>
        </div>
      </div>

      <Separator class="my-3" />

      <div class="flex flex-row gap-2 align-middle">
        <Icon icon="ic:round-track-changes" class="w-6 h-6" />
        <div class="text-xl font-medium">{{ t('tracking.heading') }}</div>
      </div>
      <div class="text-muted-foreground text-sm mb-2">{{ t('tracking.description') }}</div>
      <div class="flex flex-col gap-2">
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-col gap-0">
            <div class="font-medium">{{ t('tracking.youtube.name') }}</div>
            <div class="text-muted-foreground text-sm">{{ t('tracking.youtube.description') }}</div>
          </div>
          <Switch
            @update:model-value="(pref: boolean) => setEmbedPreference('YOUTUBE', pref)"
            :model-value="isEmbedAllowed('YOUTUBE')"
          />
        </div>
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-col gap-0">
            <div class="font-medium">{{ t('tracking.instagram.name') }}</div>
            <div class="text-muted-foreground text-sm">
              {{ t('tracking.instagram.description') }}
            </div>
          </div>
          <Switch
            @update:model-value="(pref: boolean) => setEmbedPreference('INSTAGRAM', pref)"
            :model-value="isEmbedAllowed('INSTAGRAM')"
          />
        </div>
      </div>

      <!-- About link (mobile only) -->
      <Separator class="my-3 lg:hidden" />
      <Button variant="outline" as-child class="lg:hidden w-full">
        <RouterLink to="/about" class="flex flex-row items-center gap-2">
          <Icon icon="ic:outline-info" class="w-5 h-5" />
          {{ t('about') }}
        </RouterLink>
      </Button>
    </Section>
  </DefaultLayout>
</template>
