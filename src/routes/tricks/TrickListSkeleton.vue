<script lang="ts" setup>
const SECTION_COUNT = 2;
const CARDS_PER_SECTION = 12;
</script>

<template>
  <div class="w-full flex flex-col gap-2 animate-pulse" aria-hidden="true">
    <div v-for="s in SECTION_COUNT" :key="s" class="w-full flex flex-col gap-1">
      <div class="text-2xl font-medium px-3 w-full grid grid-cols-[1fr_auto_1fr] items-center">
        <span />
        <div class="h-7 w-40 bg-muted rounded" />
        <span />
      </div>
      <div
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 w-full"
      >
        <div
          v-for="i in CARDS_PER_SECTION"
          :key="i"
          class="aspect-[7/5] rounded-sm border border-border bg-muted/60"
        />
      </div>
    </div>
  </div>
</template>
