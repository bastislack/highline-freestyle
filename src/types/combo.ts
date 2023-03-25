import {z} from "zod";
import {ZodStickFrequencyEnum} from "./enums";

//const ZodComboMetadata = z.object({
//  ...sharedMetadata
//})

const ZodCombo = z.object({
  id: z.number().int(),
  name: z.string(),
  tricks: z.array(z.number().int()).describe("Ids of Tricks that are part of this Combo, in sequential order"),
  minDiff: z.number(),
  maxDiff: z.number(),
  avgDiff: z.number(),
  totalDiff: z.number(),
  numberOfTricks: z.number().int(),
  establishedBy: z.string().describe("Name of Person that came up with it"),
  yearEstablished: z.number().int().positive().optional(),
  linkToVideo: z.string().url().optional(),
  comments: z.string().optional(),
  stickFrequency: ZodStickFrequencyEnum.optional(),
  //metadata: ZodComboMetadata.optional() TODO: Should be added in the future.
});

export type Combo = z.infer<typeof ZodCombo>;
