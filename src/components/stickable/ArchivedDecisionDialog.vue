<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DeleteTrickDialog from '@/components/stickable/trick/DeleteTrickDialog.vue';
import Button from '../ui/button/Button.vue';
import { tricksDao } from '@/lib/database';
import { useToast } from '../ui/toast';
import router from '@/routes/router';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/tricks/archivedDialogue';
import { StickableStatus } from '@/lib/utils';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

const props = defineProps<{
  trickName: string;
  trickStatus: StickableStatus;
  trickId: number;
}>();

const { toast } = useToast();

async function updateOfficialToUserDefined() {
  const trick = await tricksDao.getById(props.trickId, props.trickStatus);

  if (!trick) {
    toast({
      title: t('toasts.failedNotInDB.title'),
      description: t('toasts.failedNotInDB.description'),
    });
    return;
  }

  try {
    const [newId, newStatus] = await trick.updateStatusPersistent('userDefined');
    toast({
      title: t('toasts.success.title', { trickName: props.trickName }),
    });
    router.push({ path: `/tricks/${newStatus}/${newId}` });
  } catch (err) {
    toast({
      title: t('toasts.failedWithError.title', { trickName: props.trickName }),
      description: `${err}`,
    });
  }
}
</script>

<template>
  <Dialog :default-open="true">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('dialogue.title', { trickName: trickName }) }}</DialogTitle>
        <DialogDescription>{{ t('dialogue.description') }}</DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DeleteTrickDialog
          :trick-name="trickName"
          :trick-status="trickStatus"
          :trick-id="trickId"
        />
        <Button size="sm" @click="updateOfficialToUserDefined">{{
          t('dialogue.convertButton')
        }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
