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

const emit = defineEmits<{
  change: [frequency: number];
}>();

const { toast } = useToast();

const frequencyModel = ref<[number]>([0]);

// Last value confirmed to be in the DB. Used to roll the slider back if a
// commit-time persist fails.
let lastCommittedFrequency = 0;

watchEffect(async () => {
  const trick = await tricksDao.getById(props.trickId, props.trickStatus);
  if (trick === undefined) {
    throw new Error(`Unknown trick with key [${props.trickId}, ${props.trickStatus}]`);
  }
  const freq = trick.stickFrequency ?? 0;
  frequencyModel.value = [freq];
  lastCommittedFrequency = freq;
});

function clamp(arr: [number] | undefined): number {
  return Math.max(0, Math.min(arr === undefined ? 0 : arr[0], 7));
}

// Drag-step handler: pure UI work — update local model + notify host for the
// optimistic patch. No DB I/O, so even fast scrubs stay smooth.
function onChange(frequencyArr: [number] | undefined) {
  const frequency = clamp(frequencyArr);
  frequencyModel.value = [frequency];
  emit('change', frequency);
}

// Commit handler (slider release / keyboard commit): one DB write per gesture
// instead of one per intermediate step.
async function onCommit(frequencyArr: [number]) {
  const frequency = clamp(frequencyArr);
  if (frequency === lastCommittedFrequency) return;

  const trick = await tricksDao.getById(props.trickId, props.trickStatus);
  if (trick === undefined) {
    throw new Error(`Unknown trick with key [${props.trickId}, ${props.trickStatus}]`);
  }

  try {
    trick.stickFrequency = frequency;
    await trick.persist();
    lastCommittedFrequency = frequency;
  } catch (err) {
    frequencyModel.value = [lastCommittedFrequency];
    emit('change', lastCommittedFrequency);
    toast({
      title: t('trick.errorCannotUpdate.title'),
      description: t('trick.errorCannotUpdate.description'),
      variant: 'destructive',
    });
    console.error(err);
    throw err;
  }
}
</script>

<template>
  <StickFrequencySelector
    :frequency="frequencyModel"
    @update:frequency="onChange"
    @commit="onCommit"
  />
</template>
