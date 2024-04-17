<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Section from '@/components/ui/section/Section.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import messages from '@/i18n/settings';
import { isEmbedAllowed, setEmbedPreference } from '@/util/trackingPreferences';
import { Icon } from '@iconify/vue/dist/iconify.js';

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;
</script>

<template>
  <DefaultLayout>
    <Section>
      <div class="text-2xl">{{ t('heading-settings') }}</div>
      <Separator class="my-2" />
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
            @update:checked="(pref) => setEmbedPreference('YOUTUBE', pref)"
            :checked="isEmbedAllowed('YOUTUBE')"
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
            @update:checked="(pref) => setEmbedPreference('INSTAGRAM', pref)"
            :checked="isEmbedAllowed('INSTAGRAM')"
          />
        </div>
      </div>
    </Section>
  </DefaultLayout>
</template>
