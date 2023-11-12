<script lang="ts" setup>
import DefaultLayout from '../layouts/DefaultLayout.vue';
import { useI18n } from 'vue-i18n'

import messages from "../i18n/notFound/notFound"
import { useRoute } from 'vue-router';

const i18n = useI18n({
  messages,
  useScope: "local"
})  

const route = useRoute()

const {t} = i18n;

</script>


<template>
  <DefaultLayout :flex-spacer="false">
    <div class="flex flex-1 flex-col justify-center  self-stretch ">
      <div class="flex flex-row justify-center">
        <div class="flex flex-col">
          <h1 class="text-5xl font-bold transition-all duration-200 hover:-translate-y-3">{{ t('heading') }}</h1>
          <p class="text-sm">{{ route.fullPath }}</p>
          <p class="text-md text-neutral-400">
            {{ t('body') }}
          </p>
          <RouterLink class="p-2 rounded-lg border-primary border text-lg mt-4 text-primary hover:text-white hover:dark:bg-slate-800 hover:border-transparent hover:bg-primary duration-150 " to="/">
            {{  t("backToIndex") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </DefaultLayout>

</template>
