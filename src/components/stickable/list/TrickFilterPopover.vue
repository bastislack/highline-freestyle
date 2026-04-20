<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Switch from '@/components/ui/switch/Switch.vue';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/searchMenu';
import { sortingOptions } from '@/routes/tricks/sortingOptions';
import { getShowVariationsAsTricks, setShowVariationsAsTricks } from '@/util/variationPreferences';
import { SortOrder } from '@/types/search';

const { t } = useI18n({ messages, scope: 'local' });

defineProps<{ sortDisabled?: boolean }>();
const sortOrder = defineModel<SortOrder>('sortOrder', { required: true });
const open = defineModel<boolean>('open', { default: false });
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button size="icon" variant="ghost" :aria-label="t('filtersLabel')">
        <Icon icon="ic:round-tune" class="h-6 w-6 text-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-64">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">{{ t('sortOptionsLabel') }}</label>
          <Select v-model="sortOrder" :disabled="sortDisabled">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="option in sortingOptions"
                  :value="option.value"
                  :key="option.value"
                >
                  {{ t(option.titleKey) }}
                  <span v-if="option.directionTitleKey" class="text-muted-foreground">
                    {{ t(option.directionTitleKey) }}
                  </span>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <label class="flex flex-row items-center justify-between text-sm cursor-pointer">
          {{ t('variationsAsTricks') }}
          <Switch
            :model-value="getShowVariationsAsTricks()"
            @update:model-value="(val: boolean) => setShowVariationsAsTricks(val)"
          />
        </label>
      </div>
    </PopoverContent>
  </Popover>
</template>
