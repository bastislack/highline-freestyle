<script setup lang="ts">
import {onMounted} from "vue"

onMounted( () => {
  import("./lib/database/official/isSyncNeeded.ts").then( e => e.default())
})

</script>

<template>
  <RouterView/>
</template>

