<script setup lang="ts">
import { RouterLink } from 'vue-router';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import Section from '@/components/ui/section/Section.vue';
</script>

<template>
  <DefaultLayout>
    <Section>
      <h1 class="text-3xl my-4 font-black">Such placeholder, much wow</h1>
      <RouterLink class="text-primary-700 underline" :to="'/tricks/new'"
        >Create new Route</RouterLink
      >
    </Section>
  </DefaultLayout>
</template>
