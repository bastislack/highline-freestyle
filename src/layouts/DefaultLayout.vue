<script lang="ts" setup>
import NavbarSide from '../components/navbar/NavbarSide.vue';
import NavbarBottom from '../components/navbar/NavbarBottom.vue';
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background text-foreground m-0 p-0">
    <div class="flex flex-row m-0 p-0">
      <div class="hidden lg:block">
        <NavbarSide />
        <div class="w-56" />
      </div>
      <div>
        <slot />
        <div class="block lg:hidden">
          <div class="h-16 w-full" />
          <NavbarBottom />
        </div>
      </div>
    </div>
  </div>
</template>
