<script lang="ts" setup>
import { type Trick } from '../lib/database/daos/trick';

// This component defines a single card inside the Trick Overview
interface Props {
  trick: Trick;
}

const { trick } = defineProps<Props>();
</script>

<template>
  <div
    class="p-2 border rounded-md border-dark-gray bg-light-gray-250 flex items-center justify-center h-20 drop-shadow"
  >
    <p class="text-dark-gray text-center line-clamp-3 text-base/5">
      {{ trick.alias && trick.alias.length > 0 ? trick.alias : trick.technicalName }}
    </p>
  </div>
</template>
