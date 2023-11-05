<script lang="ts" setup>
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { Trick } from '@/lib/database/daos/trick';

const { trick } = defineProps<{
  trick: Trick
}>();

</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ trick.alias && trick.alias.length > 0 ? trick.alias : trick.technicalName }}</CardTitle>
      <CardDescription>Registred by: {{ trick.establishedBy }}</CardDescription>
    </CardHeader>
  </Card>
</template>