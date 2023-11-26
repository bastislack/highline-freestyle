<script lang="ts" setup>
import DefaultLayout from '../layouts/DefaultLayout.vue';
import TrickOverview from '../components/TrickOverview.vue';
import { ref } from 'vue';

const searchText = ref('')

</script>


<template>
  <DefaultLayout :flex-spacer="true" @update-search-query="(searchQuery) => searchText = searchQuery">
    <TrickOverview :searchText="searchText"/>
  </DefaultLayout>
</template>