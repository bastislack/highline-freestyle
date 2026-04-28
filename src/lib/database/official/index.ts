import { ref, readonly } from 'vue';
import isSyncNeeded from './isSyncNeeded';
import syncCombos from './syncCombos';
import syncTricks from './syncTricks';

const isSyncingRef = ref(false);

/**
 * Reactive flag — true while the official sync is running. UI components can
 * subscribe to keep their loading state up while the local DB is being
 * populated (e.g. on first install before any tricks exist).
 */
export const isOfficialSyncing = readonly(isSyncingRef);

/**
 * This is a Promise that handles syncing between the local (=browser) database
 * and the offical tricks and combos that will be stored in the bundle with the help
 * of the vite plugin (see /src/data/...)
 */
export default async function runSyncingProcedure() {
  if (!(await isSyncNeeded())) {
    return;
  }
  isSyncingRef.value = true;
  try {
    try {
      await syncTricks();
    } catch (err) {
      console.error(err);
    }
    try {
      await syncCombos();
    } catch (err) {
      console.error(err);
    }
    // Commit the new Hash
    const { hash } = (await import('virtual:highline-freestyle-data')).default;
    window.localStorage.setItem('DB_OFFICIAL_LAST_MODIFIED_HASH', hash);
    console.log('[Official Sync Check] Completed');
  } finally {
    isSyncingRef.value = false;
  }
}
