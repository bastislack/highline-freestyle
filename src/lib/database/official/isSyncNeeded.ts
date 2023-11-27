export default async function isSyncNeeded() {
  const { hash } = (await import('virtual:highline-freestyle-data')).default;

  // This is just here to tell TS that hash is a string :)
  if (typeof hash !== 'string') {
    throw new Error('Unexpected hash type. Should never happen');
  }

  if (!window.localStorage) {
    console.error(
      '[Official Sync Check] Browser does not support localStorage! No sync will take place'
    );
    return false;
  }
  if (window.localStorage.getItem('DB_OFFICIAL_LAST_MODIFIED_HASH') !== hash) {
    console.log('[Official Sync Check] Changes detected! Applying new Database Contents');
    return true;
  }
  console.log('[Official Sync Check] Your database is up to date.');
  return false;
}
