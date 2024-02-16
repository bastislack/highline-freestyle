<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Section from '@/components/ui/section/Section.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Switch from '@/components/ui/switch/Switch.vue';
import messages from '@/i18n/settings';

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;
</script>

<template>
  <DefaultLayout>
    <Section>
      <div class="text-3xl">{{ t('heading-settings') }}</div>
      <Separator />
      <div class="text-2xl">{{ t('cookies.heading') }}</div>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-col gap-0">
          <div class="text-lg font-medium">YouTube</div>
          <div class="text-muted-foreground">Allow YouTube embeds to be shown</div>
        </div>
        <Switch />
      </div>
      <div class="flex flex-row items-center justify-between">
        <div class="flex flex-col gap-0">
          <div class="text-lg font-medium">Instagram</div>
          <div class="text-muted-foreground">Allow Instagram embeds to be shown</div>
        </div>
        <Switch />
      </div>
    </Section>
  </DefaultLayout>
</template>
