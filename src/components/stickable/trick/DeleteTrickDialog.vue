<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';
import { useToast } from '@/components/ui/toast';
import { tricksDao } from '@/lib/database';
import router from '@/routes/router';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/tricks/delete';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

let props = defineProps<{
  trickName: string;
  trickStatus: 'archived' | 'official' | 'userDefined';
  trickId: number;
}>();

const { toast } = useToast();

async function deleteTrick() {
  const trick = await tricksDao.getById(props.trickId, props.trickStatus);

  if (!trick) {
    toast({
      title: t('toasts.failedNotInDB.title', { trickName: props.trickName }),
      description: t('toasts.failedNotInDB.description'),
    });
    return;
  }

  const name = trick.alias ?? trick.technicalName;
  try {
    await trick.delete();
    toast({
      title: t('toasts.success.title', { trickName: name }),
    });
    router.push({ path: '/tricks' });
  } catch (err) {
    toast({
      title: t('toasts.failedWithError.title', { trickName: name }),
      description: `${err}`,
    });
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger
      class="text-destructive font-medium text-sm hover:bg-destructive-100 rounded-md p-2"
    >
      {{ t('triggerButton') }}
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('dialogue.title', { trickName: trickName }) }}</DialogTitle>
        <DialogDescription>{{ t('dialogue.description') }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose class="font-medium text-sm p-2">{{ t('dialogue.cancelButton') }}</DialogClose>
        <Button @click="deleteTrick" variant="destructive" size="sm">
          {{ t('dialogue.deleteButton') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
