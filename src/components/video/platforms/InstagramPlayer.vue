<script setup lang="ts">
import { isEmbedAllowed } from '@/util/trackingPreferences';
import EmbedPrompt from '../EmbedPrompt.vue';
import Duration from '../Duration.vue';

defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();
</script>

<template>
  <EmbedPrompt v-if="!isEmbedAllowed('INSTAGRAM')" site="INSTAGRAM" />
  <div v-else>
    <div class="w-100 flex justify-center">
      <iframe
        class="aspect-[9/16] rounded-md"
        :src="url + '/embed'"
        allowtransparency="true"
        scrolling="no"
        title="video"
      ></iframe>
    </div>
    <Duration
      v-if="startTime || endTime"
      :start="startTime"
      :end="endTime"
      class="mx-auto mt-2 text-muted-foreground"
    />
  </div>
</template>
