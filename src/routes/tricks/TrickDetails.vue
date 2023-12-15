<script lang="ts" setup>
import { useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { DbTricksTableZod } from '@/lib/database/schemas/Version1Schema';

//import { tricksDao } from '@/lib/database';

const route = useRoute();

// Get and validate id
const rawId = Number(route.params.id);
const idResult = DbTricksTableZod._def.shape().id.safeParse(rawId);
const error_ = !idResult.success;
let errorMsg = '';
let id = 0;
if (!idResult.success) {
  errorMsg = 'Invalid ID';
} else {
  id = idResult.data;
}

// Get and validate status
</script>

<template>
  <DefaultLayout>
    <div v-if="error_">
      <h3>Error</h3>
      <div>{{ errorMsg }}</div>
    </div>
    <div v-else>
      <h3>Success</h3>
      <div>{{ $route.params.status }}</div>
      <div>{{ '' + id }}</div>
    </div>
  </DefaultLayout>
</template>
