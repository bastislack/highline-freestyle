<script lang="ts" setup>
import NavbarSide from '../components/navbars/NavbarSide.vue';
import NavbarBottom from '../components/navbars/NavbarBottom.vue';

</script>

<template>
  <div class="flex flex-col min-h-screen bg-white text-stone-900 m-0 p-0">
    <div class="flex flex-row m-0 p-0">
      <div class="collapse lg:visible">
        <NavbarSide />
        <div class="w-56"/>
      </div>
      <div>
        <slot />
        <div class="visible lg:collapse">
          <div class="h-16 w-full" />
          <NavbarBottom />
        </div>
      </div>
    </div>
  </div>
</template>