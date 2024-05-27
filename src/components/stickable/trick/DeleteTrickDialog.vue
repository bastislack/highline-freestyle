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

let props = defineProps<{
  trickName: string;
  trickStatus: 'archived' | 'official' | 'userDefined';
  trickId: number;
}>();

const { toast } = useToast();

async function deleteTrickIfPossible() {
  console.log('Deleting.');

  const trick = await tricksDao.getById(props.trickId, props.trickStatus);

  if (!trick) {
    toast({
      title: 'Failed to delete',
      description: "Couldn't locate the trick in the database.",
    });
    return;
  }

  const name = trick.alias ?? trick.technicalName;
  try {
    await trick.delete();
  } catch (err) {
    //TODO: Add Toast for user to see the error.
    console.error(`Failed to delete trick ${name} with error:`, err);
  }

  toast({
    title: `Deleted trick ${name}`,
  });
}
</script>

<template>
  <Dialog>
    <DialogTrigger
      class="text-destructive font-medium text-sm hover:bg-destructive-100 rounded-md p-2"
    >
      Delete
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete trick {{ trickName }} permanently?</DialogTitle>
        <DialogDescription> You can not undo this action! </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose class="font-medium text-sm p-2">Cancel</DialogClose>
        <Button @click="deleteTrickIfPossible" variant="destructive" size="sm"
          >Delete permanently</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
