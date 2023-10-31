import isSyncNeeded from "./isSyncNeeded";
import syncCombos from "./syncCombos";
import syncTricks from "./syncTricks";

/**
 * This is a Promise that handles syncing between the local (=browser) database
 * and the offical tricks and combos that will be stored in the bundle with the help
 * of the vite plugin (see /src/data/...)
 */
export default async function runSyncingProcedure() {
  if(!await isSyncNeeded()) {
    return
  }
  try {
    await syncTricks()
  }
  catch(err) {
    console.log(err)
  }
  try {
    await syncCombos();
  }
  catch(err) {
    console.log(err)
  }
  // Commit the new Hash
  const {hash} = (await import("virtual:highline-freestyle-data")).default;
  window.localStorage.setItem("DB_OFFICIAL_LAST_MODIFIED_HASH", hash)
  console.log("[Official Sync Check] Completed")
}