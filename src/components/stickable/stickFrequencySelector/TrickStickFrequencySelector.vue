<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { tricksDao } from '@/lib/database';
import StickFrequencySelector from './StickFrequencySelector.vue';
import { useToast } from '@/components/ui/toast';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/metadata/stickFrequency';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

const props = defineProps<{
  trickId: number;
  trickStatus: 'official' | 'archived' | 'userDefined';
}>();

const { toast } = useToast();

const frequencyModel = ref<[number]>([0]);

watchEffect(async () => {
  const trick = await tricksDao.getById(props.trickId, props.trickStatus);
  if (trick === undefined) {
    throw new Error(`Unknown trick with key [${props.trickId}, ${props.trickStatus}]`);
  }
  frequencyModel.value = [trick.stickFrequency ?? 0];
});

async function updateStickFrequency(frequencyArr: [number]) {
  const frequency = Math.max(0, Math.min(frequencyArr[0], 7));

  const trick = await tricksDao.getById(props.trickId, props.trickStatus);
  if (trick === undefined) {
    throw new Error(`Unknown trick with key [${props.trickId}, ${props.trickStatus}]`);
  }

  try {
    trick.stickFrequency = frequency;
    await trick.persist();
  } catch (err) {
    toast({
      title: t('trick.errorCannotUpdate.title'),
      description: t('trick.errorCannotUpdate.description'),
      variant: 'destructive',
    });
    console.error(err);
    throw err;
  }

  frequencyModel.value = [frequency];
}
</script>

<template>
  <StickFrequencySelector :frequency="frequencyModel" @update:frequency="updateStickFrequency" />
</template>
