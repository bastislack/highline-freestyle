<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { z } from 'zod';
import { onMounted, ref, watch } from 'vue';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { DbTricksTableZod } from '@/lib/database/schemas/Version1Schema';
import { tricksDao, Trick } from '@/lib/database';

const route = useRoute();

let inputError: boolean = false;
let errorMsg: string[] = [];

function parseAndValidateId(): z.SafeParseReturnType<number, number> {
  const idRaw = Number(route.params.id);
  const idResult = DbTricksTableZod._def.shape().id.safeParse(idRaw);
  return idResult;
}

function parseAndValidateStatus(): z.SafeParseReturnType<
  'official' | 'userDefined' | 'archived',
  'official' | 'userDefined' | 'archived'
> {
  const statusRaw = route.params.status;
  const statusResult = DbTricksTableZod._def.shape().trickStatus.safeParse(statusRaw);
  //let status: DbTricks["trickStatus"] = "official";
  return statusResult;
}

async function getTrick(): Promise<Trick> {
  const idResult: z.SafeParseReturnType<number, number> = parseAndValidateId();
  if (!idResult.success) {
    return undefined;
  }

  const statusResult = parseAndValidateStatus();
  if (!statusResult.success) {
    return undefined;
  }

  return await tricksDao.getById(idResult.data, statusResult.data);
}

let trick = ref<Trick>(undefined);

// Load content initially
onMounted(async () => {
  trick.value = await getTrick();
});

// Update content when URL changes
watch(route, async () => {
  trick.value = await getTrick();
});
</script>

<template>
  <DefaultLayout>
    <div class="m-3 lg:m-6">
      <div v-if="inputError">
        <h3 class="text-2xl">Error</h3>
        <div>{{ errorMsg }}</div>
      </div>
      <div v-else>
        <h3 class="text-2xl">Success</h3>
        <!--<div>{{ status }}</div>-->
        <!--<div>{{ '' + id }}</div>-->
        <div v-if="trick !== undefined">
          {{ trick.technicalName }}
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
