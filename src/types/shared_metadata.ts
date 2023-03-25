import {z} from "zod";
import {ZodStickFrequencyEnum} from "./enums";

export const sharedMetadata = {
  boosted: z.boolean().default(false),
  notes: z.string().optional(),
  stickFrequency: ZodStickFrequencyEnum.optional(),
};
