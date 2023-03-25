import {Plugin, createLogger, Logger, ConfigEnv} from "vite";
import {handleTricks} from "./trickParser";
const VirtualModuleId = "virtual:csvData";
const ResolvedVirtualModuleid = " \0" + VirtualModuleId;

export default function trickFetcherPlugin(): Plugin {
  let logger: Logger;
  let config: ConfigEnv;

  return {
    name: "CsvFetcher",

    resolveId(id) {
      if (id === VirtualModuleId) {
        return ResolvedVirtualModuleid;
      }
    },
    configResolved(cfg) {
      config = cfg;
      logger = createLogger(cfg.logLevel, {
        prefix: "[csv-fetcher]",
      });
    },
    load(id) {
      if (id === ResolvedVirtualModuleid) {
        return handleVirtualModule(config, logger);
      }
    },
  };
}

export interface TrickParseError {
  reason: string;
  offendingEntryId: number | undefined;
  message: string;
  value?: any;
}

async function handleVirtualModule(cfg: ConfigEnv, logger: Logger) {
  const [trickResponse] = await Promise.all([handleTricks(cfg, logger)]);
  return `
  export const tricks = ${JSON.stringify(trickResponse.parsedEntries)};
  export const trickErrors = ${JSON.stringify(trickResponse.errors)};
  export const combos = []; // TODO
  export const comboErrors = []; // TODO
  `;
}
