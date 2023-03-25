import {ConfigEnv, Logger} from "vite";

export function shouldFetchData(cfg: ConfigEnv, logger: Logger): boolean {
  if (!cfg || cfg.mode === "development") {
    // We are in dev mode. We will use mocking data, EXCEPT if USE_SHEETS_COMBOS=1 is set
    if (process.env["USE_SHEETS_COMBOS"] !== "1") {
      logger.info("Developer Mode detected. Using mocked data for combos. Set USE_SHEETS_COMBOS=1 to use real data.", {
        timestamp: true,
      });
      return false;
    }
  }
  return true;
}
