<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import messages from '@/i18n/video';
import Button from '../ui/button/Button.vue';
import { type EmbedSite, setEmbedPreference } from '@/util/trackingPreferences';

defineProps<{
  site: EmbedSite;
}>();

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;

const buttonTranslationKey: Record<EmbedSite, string> = {
  INSTAGRAM: 'embedPermissions.instagram.onlyInstagram',
  YOUTUBE: 'embedPermissions.youtube.onlyYouTube',
};

const questionTranslationKey: Record<EmbedSite, string> = {
  INSTAGRAM: 'embedPermissions.instagram.question',
  YOUTUBE: 'embedPermissions.youtube.question',
};

function allowYouTubeAndInstagramEmbeds() {
  setEmbedPreference('YOUTUBE', true);
  setEmbedPreference('INSTAGRAM', true);
}
</script>

<template>
  <div class="w-full bg-background border border-border p-3 lg:p-5 rounded-sm">
    <div class="flex flex-col gap-2 align-middle w-full text-sm">
      <div class="font-medium text-lg">{{ t('embedPermissions.heading') }}</div>
      <div>
        {{ t(questionTranslationKey[site]) }}
      </div>
      <div class="text-muted-foreground">{{ t('embedPermissions.details') }}</div>
      <div class="flex flex-row gap-2">
        <Button size="sm" variant="outline" :onclick="() => setEmbedPreference(site, true)">
          {{ t(buttonTranslationKey[site]) }}
        </Button>
        <Button size="sm" variant="outline" :onclick="allowYouTubeAndInstagramEmbeds">
          {{ t('embedPermissions.youtubeAndInstagram') }}
        </Button>
      </div>
    </div>
  </div>
</template>
