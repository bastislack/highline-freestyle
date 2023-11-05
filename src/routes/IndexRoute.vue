<script lang="ts" setup>
import DefaultLayout from '../layouts/DefaultLayout.vue';
import TrickOverview from '../components/trick-list/index.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

</script>


<template>
  <DefaultLayout :flex-spacer="true">
    <Suspense>
      <TrickOverview />
      <template #fallback>
        <LoadingSpinner/>
      </template>
    </Suspense>
  </DefaultLayout>
</template>
