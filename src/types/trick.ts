import {z} from "zod";
import {ZodPositionEnum} from "./enums";
import {sharedMetadata} from "./shared_metadata";

const ZodTrickMetaData = z.object({
  ...sharedMetadata,
});

/**
 * Type-safe Trick Object Definition with zod.
 */
const ZodTrick = z.object({
  id: z.number().int(),
  alias: z.string().optional(),
  technicalName: z.string(),
  establishedBy: z.string().optional(),
  yearEstablished: z.number().int().positive().optional(),
  linkToVideo: z.string().url().optional(),
  videoStartTime: z.number().positive().optional(),
  videoEndTime: z.number().positive().optional(),
  startPos: ZodPositionEnum,
  endPos: ZodPositionEnum,
  difficultyLevel: z.number().int().min(0).max(11),
  description: z.string(),
  tips: z.array(z.string()).optional(),
  recommendedPrerequisiteIds: z.array(z.number()).optional(),
  metadata: ZodTrickMetaData.optional(),
});

export type Trick = z.infer<typeof ZodTrick>;
export function parseTrick(data: unknown): Trick {
  return ZodTrick.parse(data);
}
