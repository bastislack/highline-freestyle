<script lang="ts" setup>
import { ref, shallowRef, computed, onMounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useI18n } from 'vue-i18n';

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Header from '@/components/stickable/Header.vue';
import Section from '@/components/ui/section/Section.vue';
import ErrorInfo from '@/components/ErrorInfo.vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import TrickForm from '@/components/stickable/trick/TrickForm.vue';
import type { TrickFormSchema } from '@/components/stickable/trick/TrickForm.vue';

import messages from '@/i18n/tricks/edit/index';
import { tricksDao } from '@/lib/database';
import type { Trick } from '@/lib/database/daos/trick';
import { useHistoryNav } from '@/composables/useHistoryNav';
import { useTrickRouteParams } from '@/composables/useTrickRouteParams';

const router = useRouter();
const { toast } = useToast();
const { showBack, goBack, goHome, backOrReplace } = useHistoryNav('/tricks');

const { t } = useI18n({ messages, useScope: 'local' });
const { id, status } = useTrickRouteParams();

const trick = shallowRef<Trick | undefined>(undefined);
const isLoaded = ref(false);
const formRef = ref<InstanceType<typeof TrickForm> | null>(null);

const confirmedLeave = ref(false);
const showCancelDialog = ref(false);
let pendingNavigation = '';

onBeforeRouteLeave((to) => {
  if (confirmedLeave.value) return true;
  if (!formRef.value?.meta.dirty) return true;
  pendingNavigation = to.fullPath;
  showCancelDialog.value = true;
  return false;
});

onMounted(async () => {
  if (!id.value || !status.value) {
    isLoaded.value = true;
    return;
  }
  if (status.value === 'official') {
    router.replace(`/tricks/official/${id.value}`);
    return;
  }
  try {
    trick.value = await tricksDao.getById(id.value, status.value);
  } finally {
    isLoaded.value = true;
  }
});

const trickInitialValues = computed(() => {
  if (!trick.value) return undefined;
  return {
    technicalName: trick.value.technicalName,
    alias: trick.value.alias,
    establishedBy: trick.value.establishedBy,
    difficulty: trick.value.difficultyLevel ?? ('' as const),
    startPosition: trick.value.startPosition,
    endPosition: trick.value.endPosition,
    description: trick.value.description,
    tips: trick.value.tips?.join('\n'),
    yearEstablished: trick.value.yearEstablished ?? ('' as const),
    variationOf: trick.value.variationOf ?? [],
    recommendedPrerequisites: trick.value.recommendedPrerequisites ?? [],
    videos: trick.value.videos ?? [],
  };
});

async function onSubmit(vals: TrickFormSchema) {
  if (!trick.value) return;

  try {
    trick.value.technicalName = vals.technicalName;
    trick.value.alias = vals.alias || undefined;
    trick.value.establishedBy = vals.establishedBy || undefined;
    trick.value.difficultyLevel = vals.difficulty === '' ? undefined : vals.difficulty;
    trick.value.startPosition = vals.startPosition;
    trick.value.endPosition = vals.endPosition;
    trick.value.description = vals.description || undefined;
    trick.value.tips = vals.tips;
    trick.value.yearEstablished = vals.yearEstablished === '' ? undefined : vals.yearEstablished;
    trick.value.variationOf = vals.variationOf;
    trick.value.recommendedPrerequisites = vals.recommendedPrerequisites;
    trick.value.videos = vals.videos;

    const result = await trick.value.persist();
    if (result !== true) throw new Error(result);

    confirmedLeave.value = true;
    toast({
      title: t('toast.savedTrick', { name: vals.alias || vals.technicalName }),
      duration: 5000,
    });
    backOrReplace(`/tricks/${status.value}/${id.value}`);
  } catch (err) {
    console.error(err);
    toast({
      title: t('error.title'),
      description: t('error.message'),
      class: 'bg-destructive-700 text-white',
      duration: 5000,
    });
  }
}

function onCancel() {
  if (showBack.value) goBack();
  else goHome();
}

function confirmLeave() {
  confirmedLeave.value = true;
  showCancelDialog.value = false;
  router.push(pendingNavigation);
}
</script>

<template>
  <DefaultLayout>
    <Header>{{ t('headerTitle') }}</Header>
    <Section v-if="isLoaded && trick">
      <Suspense>
        <TrickForm
          ref="formRef"
          :initial-values="trickInitialValues"
          :submit-label="t('buttonSubmit')"
          :show-suggestion-toggle="false"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </Suspense>
    </Section>
    <Section
      v-else-if="isLoaded && !trick"
      class="w-full h-full flex flex-col items-center justify-center"
    >
      <ErrorInfo
        :code="404"
        :title="t('error.notFound.title')"
        :description="t('error.notFound.description')"
      />
    </Section>
    <Section v-else class="grid gap-4 lg:gap-6 grid-cols-4 animate-pulse" aria-hidden="true">
      <div class="col-span-4 md:col-span-2 h-16 bg-muted rounded" />
      <div class="col-span-4 md:col-span-2 h-16 bg-muted rounded" />
      <div class="col-span-2 md:col-span-1 h-16 bg-muted rounded" />
      <div class="col-span-2 md:col-span-1 h-16 bg-muted rounded" />
      <div class="col-span-4 md:col-span-2 h-16 bg-muted rounded" />
      <div class="col-span-4 h-20 bg-muted rounded" />
      <div class="col-span-4 md:col-span-2 h-16 bg-muted rounded" />
      <div class="col-span-4 md:col-span-2 h-16 bg-muted rounded" />
      <div class="col-span-4 h-20 bg-muted rounded" />
      <div class="col-span-4 md:col-span-2 h-24 bg-muted rounded" />
      <div class="col-span-4 md:col-span-2 h-24 bg-muted rounded" />
      <div class="col-span-4 h-16 bg-muted rounded" />
    </Section>
  </DefaultLayout>

  <Dialog :open="showCancelDialog" @update:open="showCancelDialog = $event">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('cancelDialog.title') }}</DialogTitle>
        <DialogDescription>{{ t('cancelDialog.description') }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="ghost" size="sm">{{ t('cancelDialog.dismiss') }}</Button>
        </DialogClose>
        <Button variant="destructive" size="sm" @click="confirmLeave">
          {{ t('cancelDialog.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
