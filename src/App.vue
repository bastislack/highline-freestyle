<script setup lang="ts">
import {onMounted} from "vue"

onMounted( async() => {
  (await import("./lib/database/official/index")).default()
})

</script>

<template>
  <RouterView/>
</template>

