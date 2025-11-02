<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { StickableStatus } from '@/lib/utils';
import Popover from '@/components/ui/popover/Popover.vue';
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '@/components/ui/popover/PopoverContent.vue';
import messages from '@/i18n/list';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  isNew: boolean;
  status: StickableStatus;
}>();

const { t } = useI18n({
  messages,
  useScope: 'local',
});

const isUserDefined = computed(() => props.status === 'userDefined');
const isArchived = computed(() => props.status === 'archived');
const show = computed(() => props.isNew || isUserDefined.value || isArchived.value);

type StatusKey = 'personal' | 'archived' | 'new';
const currentStatus = computed(() => {
  let key: StatusKey = 'new';
  let icon = 'ic:baseline-new-releases';

  if (isUserDefined.value) {
    key = 'personal';
    icon = 'ic:round-person';
  } else if (isArchived.value) {
    key = 'archived';
    icon = 'ic:baseline-archive';
  } else if (props.isNew) {
    key = 'new';
    icon = 'ic:baseline-new-releases';
  }

  return {
    key,
    icon,
    title: t(`cards.status.${key}.title`),
    description: t(`cards.status.${key}.description`),
  };
});
</script>

<template>
  <div v-if="show" class="absolute top-1 right-1">
    <Popover>
      <PopoverTrigger>
        <button
          type="button"
          class="rounded outline-none hover:bg-muted"
          :aria-label="currentStatus.title"
          @click.prevent
        >
          <Icon :icon="currentStatus.icon" class="h-5 w-5" />
        </button>
      </PopoverTrigger>

      <PopoverContent>
        <div class="space-y-1">
          <div class="flex justify-center items-center space-x-1">
            <Icon :icon="currentStatus.icon" class="h-5 w-5" />
            <p class="text-sm font-medium">
              {{ currentStatus.title }}
            </p>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ currentStatus.description }}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
