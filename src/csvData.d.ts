/**
 * This File is responsible for providing types for the Virtual Module
 * `virtual:csvData`
 */

//import type {TrickData} from "../plugins/trickFetcher/trickParser"
//import type {TrickParseError} from "../plugins/trickFetcher/trickFetcher"

// TODO For Future: This is simply copied from the commented out lines above.
// TS would not like to resolve them when I tried to just import them.

declare interface TrickParseError {
  reason: string;
  offendingEntryId: number | undefined;
  message: string;
  value?: any;
}

declare module "virtual:csvData" {
  export const tricks: unknown[]; // This is "Trick[]" from "./types/trick".
  export const trickErrors: TrickParseError[];
  export const combos: unknown[];
  export const comboErrors: unknown[];
}
