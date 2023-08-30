<script lang="ts" setup>
import DefaultLayout from '../layouts/DefaultLayout.vue';

</script>


<template>
  <DefaultLayout :flex-spacer="false">
    <div class="flex flex-1 flex-col justify-center  self-stretch ">
      <div class="flex flex-row justify-center">
        <h1 class="text-5xl font-bold dark:text-white transition-all duration-200 hover:-translate-y-3">Hello World!</h1>
      </div>
    </div>
  </DefaultLayout>

</template>