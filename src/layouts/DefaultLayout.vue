<script lang="ts" setup>
import NavbarSide from '../components/navbar/NavbarSide.vue';
</script>

<template>
  <div class="min-h-screen w-full bg-background text-foreground m-0 p-0">
    <div class="flex flex-row m-0 p-0">
      <div class="hidden lg:block">
        <NavbarSide />
        <div class="w-56" />
      </div>
      <div class="w-full min-h-screen flex flex-col items-center">
        <slot />
      </div>
    </div>
  </div>
</template>
