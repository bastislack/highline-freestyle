<script lang="ts" setup>
import NavbarSide from '../components/NavbarSide.vue';

</script>

<template>
  <div class="flex flex-col min-h-screen dark:bg-gray-950 m-0 p-0">
    <div class="flex flex-row m-0 p-0">
      <div class="collapse md:visible">
        <NavbarSide />
        <div class="w-56"/>
      </div>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>