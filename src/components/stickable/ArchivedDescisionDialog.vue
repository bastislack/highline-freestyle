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

defineProps<{
  trickName: string;
  trickStatus: 'archived' | 'official' | 'userDefined';
  trickId: number;
}>();
</script>

<template>
  <Dialog :default-open="true">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>This trick has been archived!</DialogTitle>
        <DialogDescription>
          This trick used to be an official one but has been removed from the list of official
          tricks. You can keep the trick by converting it into a custom one (allowing you to edit it
          from now on) or delete it from your list of tricks. If you don't take any action now, you
          will be prompted again next time.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DeleteTrickDialog
          :trick-name="trickName"
          :trick-status="trickStatus"
          :trick-id="trickId"
        />
        <Button size="sm">Convert into custom Trick</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
