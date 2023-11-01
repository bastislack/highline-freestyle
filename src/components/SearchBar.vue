<script lang="ts" setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue';

const searchText = ref('')

</script>


<template>
  <input v-model="searchText" type="text"
    class="m-2 mt-4 border-2 border-dark-gray bg-light-gray-250 h-10 px-5 rounded-lg text-sm focus:outline-none"
    placeholder="Search trick" @input="$emit('update-search-text', searchText)">
</template>