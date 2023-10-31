declare module "virtual:highline-freestyle-data" {
  export const hash: string
  // We use unknown[] as a type here because we cannot
  // import our Zod Types into a d.ts.
  // and given the fact that the data here
  // get pushed through Zod as soon as it gets
  // imported, it doesnt really matter.
  export const combos: unknown[]
  export const tricks: unknown[]
}