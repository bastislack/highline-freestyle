<script lang="ts" setup>
import DefaultLayout from '../layouts/DefaultLayout.vue';
import { useI18n } from 'vue-i18n'

import messages from "../i18n/index"

const i18n = useI18n({
  messages,
  useScope: "local"
})  

const {t} = i18n;

</script>


<template>
  <DefaultLayout :flex-spacer="false">
    <div class="flex flex-1 flex-col justify-center  self-stretch ">
      <div class="flex flex-row justify-center">
        <h1 class="text-5xl font-bold dark:text-white transition-all duration-200 hover:-translate-y-3">{{ t('greeting') }}</h1>
      </div>
    </div>
  </DefaultLayout>

</template>
