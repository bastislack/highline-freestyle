<script lang="ts" setup>
import Footer from '../components/Footer.vue';
import Navbar from '../components/Navbar.vue';

interface Props {
  flexSpacer?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar type="fixed" />
    <div class="h-14" />
    <slot />
    <div v-if="props.flexSpacer ?? true" class="flex-1" />
    <Footer />
  </div>
</template>
