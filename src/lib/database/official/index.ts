import isSyncNeeded from "./isSyncNeeded";
import syncTricks from "./syncTricks";

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
  // await syncCombos();

  // Commit the new Hash
  // @ts-expect-error No .d.ts defined yet
  const {hash} = (await import("virtual:highline-freestyle-data")).default;
  window.localStorage.setItem("DB_OFFICIAL_LAST_MODIFIED_HASH", hash)
  console.log("[Official Sync Check] Completed")
}