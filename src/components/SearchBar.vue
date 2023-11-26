<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { Icon } from '@iconify/vue';

const emit = defineEmits(['updateSearchQuery'])

const searchText = ref('')
const isSearchActive = ref(false)
const searchInputField = ref(null)

function clearSearchText() {
  searchText.value = ''
  emit('updateSearchQuery', searchText.value)
}

async function activateSearch() {
  isSearchActive.value = true
  await nextTick()
  if (searchInputField.value) {
    (searchInputField.value as HTMLElement).focus()
  }
}

function deactivateSearch() {
  clearSearchText()
  isSearchActive.value = false
}

function onBlur() {
  if (searchText.value.length === 0) {
    deactivateSearch()
  }
}

</script>


<template>
  <div class="relative flex z-30 bg-white border-b-2 border-dark-gray">
    <Icon icon="ic:round-search" @click="activateSearch"
      :class="`absolute z-30 text-lg ${isSearchActive ? 'left-4' : 'right-4'}`" />

    <input v-if="isSearchActive" v-model="searchText" ref="searchInputField" type="text"
      class="w-full m-2 border-2 border-dark-gray bg-light-gray-250 h-10 z-20 px-7 rounded-lg text-sm focus:outline-secondary"
      placeholder="Search trick" @input="$emit('updateSearchQuery', searchText)" @blur="onBlur">

    <Icon icon="ic:round-cancel" v-if="searchText" @click="deactivateSearch"
      class="absolute right-4 z-40 text-lg" />
  </div>
</template>