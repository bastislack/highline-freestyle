<script setup lang="ts">
import Section from '@/components/ui/section/Section.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { useI18n } from 'vue-i18n';

import messages from '@/i18n/about';

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-3xl mx-6 md:mx-0 mb-2 mt-5">{{ t('general.title') }}</h1>
      <p class="mt-2 mx-6 md:mx-0">{{ t('general.content') }}</p>

      <h1 class="text-2xl mx-6 md:mx-0 mt-4 mb-2 lg:mt-8">{{ t('rewriteInfo.title') }}</h1>
      <p class="mt-2 mx-6 md:mr-0">
        <i18n-t keypath="rewriteInfo.content.info" tag="p">
          <template #newline><br class="mb-2" /></template>
          <template #debt>
            <a href="https://en.wikipedia.org/wiki/Technical_debt" class="underline">
              {{ t('rewriteInfo.content.debt') }}
            </a>
          </template>
        </i18n-t>
      </p>

      <h1 class="text-2xl mx-6 md:mx-0 mt-4 mb-2 lg:mt-8">{{ t('privacy.title') }}</h1>
      <p class="mt-2 mx-6 md:mr-0">
        <i18n-t keypath="privacy.content" tag="p">
          <template #newline><br class="mb-2" /></template>
        </i18n-t>
      </p>

      <h1 class="text-2xl mx-6 md:mx-0 mt-4 mb-2 lg:mt-8">{{ t('contribute.title') }}</h1>
      <p class="mt-2 mx-6 md:mr-0">
        {{ t('contribute.content.info') }}
        <a
          href="https://github.com/bastislack/highline-freestyle"
          class="flex flex-row gap-2 my-2 items-center underline"
        >
          <Icon icon="simple-icons:github" class="h-5 w-5" />
          {{ t('contribute.content.github') }}
        </a>
      </p>
    </Section>
  </DefaultLayout>
</template>
