<script lang="ts" setup>
import Footer from '../components/Footer.vue';
import Navbar from '../components/Navbar.vue';

interface Props {
  flexSpacer?: boolean
}

const props = defineProps<Props>()

</script>

<template>
  <div class="flex flex-col min-h-screen dark:bg-gray-950">
    <Navbar type="fixed" />
    <main class="relative mt-16 mx-2 sm:container">
      <slot />
    </main>
    <div v-if="props.flexSpacer ?? true" class="flex-1"/>
    <Footer/>
  </div>
</template>