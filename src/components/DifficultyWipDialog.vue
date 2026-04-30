<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';
import { onboardingTipHasBeenShown, setOnboardingTipAsShown } from '@/util/onboarding';
import messages from '@/i18n/wipDialog';

const { t } = useI18n({ messages, useScope: 'local' });

const isOpen = ref(!onboardingTipHasBeenShown('DifficultyWIP'));

function handleOpenChange(open: boolean) {
  isOpen.value = open;
  if (!open) setOnboardingTipAsShown('DifficultyWIP');
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('difficultyWip.title') }}</DialogTitle>
        <DialogDescription>{{ t('difficultyWip.description') }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button size="sm" @click="handleOpenChange(false)">
          {{ t('difficultyWip.acknowledge') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
