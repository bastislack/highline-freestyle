<script setup lang="ts">
import { isEmbedAllowed } from '@/util/trackingPreferences';
import EmbedPrompt from '../EmbedPrompt.vue';
import { computed } from 'vue';

const props = defineProps<{
  url: string;
  startTime?: number;
  endTime?: number;
}>();

const embedUrl = computed(() => {
  let baseUrl = props.url.trim();

  // Guarantee it ends with a slash before appending "embed"
  if (baseUrl.endsWith('/')) {
    return baseUrl + 'embed';
  } else {
    return baseUrl + '/embed';
  }
});
</script>

<template>
  <EmbedPrompt v-if="!isEmbedAllowed('INSTAGRAM')" site="INSTAGRAM" />
  <div v-else>
    <div class="w-100 flex justify-center">
      <iframe
        class="aspect-[9/16] rounded-md"
        :src="embedUrl"
        allowtransparency="true"
        scrolling="no"
        title="video"
      ></iframe>
    </div>
  </div>
</template>
