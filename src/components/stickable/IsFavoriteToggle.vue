<script setup lang="ts">
import { combosDao, tricksDao } from '@/lib/database';
import { StickableStatus, StickableType } from '@/lib/utils';
import { computed, ref } from 'vue';
import { useToast } from '@/components/ui/toast';
import { onboardingTipHasBeenShown, setOnboardingTipAsShown } from '@/util/onboarding';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/metadata/favorite';

import Button from '@/components/ui/button/Button.vue';
import { Icon } from '@iconify/vue/dist/iconify.js';

const props = defineProps<{
  id: number;
  status: StickableStatus;
  stickableType: StickableType;
}>();

const { toast } = useToast();

const i18n = useI18n({
  messages,
  useScope: 'local',
});
const { t } = i18n;

const isFavorite = ref<boolean>(false);

async function setButtonStateToDBState() {
  if (props.stickableType === 'Trick') {
    const trick = await tricksDao.getById(props.id, props.status);
    if (trick === undefined) {
      throw new Error(`Could not locate trick with id in database: [${props.id}, ${props.status}]`);
    }
    isFavorite.value = trick.isFavourite;
  } else if (props.stickableType === 'Combo') {
    const combo = await combosDao.getById(props.id, props.status);
    if (combo === undefined) {
      throw new Error(`Could not locate combo with id in database: [${props.id}, ${props.status}]`);
    }
    isFavorite.value = combo.isFavourite;
  }
}

async function toggleFavorite() {
  if (props.stickableType === 'Trick') {
    await toggleFavoriteTrick();
  } else if (props.stickableType === 'Combo') {
    await toggleFavoriteCombo();
  }

  if (isFavorite.value && !onboardingTipHasBeenShown('SetFavorite')) {
    toast({
      title: t('onboardingInfo.titel'),
      description: t(
        props.stickableType == 'Trick'
          ? 'onboardingInfo.descriptionTrick'
          : 'onboardingInfo.descriptionCombo'
      ),
      duration: 9000,
    });
    setOnboardingTipAsShown('SetFavorite');
  }
}

async function toggleFavoriteTrick() {
  const trick = await tricksDao.getById(props.id, props.status);
  if (trick === undefined) {
    throw new Error(`Could not locate trick with id in database: [${props.id}, ${props.status}]`);
  }
  trick.isFavourite = !trick.isFavourite;
  await trick.persist();
  isFavorite.value = trick.isFavourite;
}

async function toggleFavoriteCombo() {
  const combo = await combosDao.getById(props.id, props.status);
  if (combo === undefined) {
    throw new Error(`Could not locate combo with id in database: [${props.id}, ${props.status}]`);
  }
  combo.isFavourite = !combo.isFavourite;
  await combo.persist();
  isFavorite.value = combo.isFavourite;
}

const icon = computed(() => (isFavorite.value ? 'ic:round-star' : 'ic:round-star-border'));

setButtonStateToDBState();
</script>

<template>
  <Button size="icon" variant="ghost" @click="toggleFavorite" class="rounded-full">
    <Icon :icon="icon" class="h-7 w-7 text-primary" />
  </Button>
</template>
