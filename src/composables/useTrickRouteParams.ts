import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { DbTricksTableZod } from '@/lib/database/schemas/CurrentVersionSchema';

const { id: idSchema, trickStatus: statusSchema } = DbTricksTableZod._def.shape();

export function useTrickRouteParams() {
  const route = useRoute();
  const id = computed(() => {
    const result = idSchema.safeParse(Number(route.params.id));
    return result.success ? result.data : undefined;
  });
  const status = computed(() => {
    const result = statusSchema.safeParse(route.params.status);
    return result.success ? result.data : undefined;
  });
  return { id, status };
}
