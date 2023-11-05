<script setup lang="ts">
import { ref } from 'vue'
import { Trick } from '@/lib/database/daos/trick';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import TrickOverviewCard from './TrickOverviewCard.vue';

interface Props {
  level: string
  tricks: Trick[]
}

const { level, tricks } = defineProps<Props>();
const isOpen = ref(true)
</script>


<script lang="ts">
export default {
  data() {
    return {
      isSticky: false
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      const rect = this.$el.getBoundingClientRect();
      this.isSticky = rect.top <= 64;
    }
  }
};
</script>


<template>
  <Collapsible v-model:open="isOpen" class="mb-5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 shadow-md">
    <CollapsibleTrigger class="text-primary text-xl font-semibold text-center p-2 w-full bg-primary-foreground border-b" :class="isSticky ? 'top-14 sticky z-30' : 'static' ">
      Level {{ level }}
    </CollapsibleTrigger>
    <CollapsibleContent class="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2" :class="{ 'p-2': isOpen }">
      <TrickOverviewCard v-for="trick in tricks" :trick="trick" :key="trick.primaryKey.join('-')" />
    </CollapsibleContent>
  </Collapsible>
</template>

<style scoped>
.sticky {
  position: sticky;
}
</style>