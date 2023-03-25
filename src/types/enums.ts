import {z} from "zod";

/* eslint-disable @typescript-eslint/naming-convention */
export const ZodStickFrequencyEnum = z.enum([
  "Never Tried",
  "Work in Progress",
  "Once",
  "Rarely",
  "Sometimes",
  "Often",
  "Generally",
  "Always",
]);
/* eslint-enable */
export type StickFrequency = z.infer<typeof ZodStickFrequencyEnum>;

// This is for legacy DB purposes and should be removed at some point
/* eslint-disable @typescript-eslint/naming-convention */
const StickFrequencyLegacyLookup: Record<StickFrequency, number> = {
  "Never Tried": 0,
  "Work in Progress": 1,
  Once: 2,
  Rarely: 3,
  Sometimes: 4,
  Often: 5,
  Generally: 6,
  Always: 7,
};
/* eslint-enable */

export function stickFrequencyToLegacy(stickFrequency: StickFrequency) {
  return StickFrequencyLegacyLookup[stickFrequency];
}

export function stickFrequencyFromLegacy(legacyId: number): StickFrequency {
  if (legacyId % 1 !== 0) {
    throw new Error("Provided Legacy ID is not an integer");
  }
  if (legacyId < 0 || legacyId > 7) {
    throw new Error("Provided Legacy ID is out of bounds. Needs to be within [0...7]");
  }
  for (const key in Object.keys(StickFrequencyLegacyLookup)) {
    if (StickFrequencyLegacyLookup[key] === legacyId) {
      return key as StickFrequency;
    }
  }
  throw new Error("Failed to get Stick Frequency ID. This should not happen.");
}

export const ZodPageEnum = z.enum([
  "TrickList",
  "TrickDetails",
  "PostTrick",
  "ComboList",
  "ComboDetails",
  "PostCombo",
  "ComboGenerator",
]);
export type Page = z.infer<typeof ZodPageEnum>;

export const ZodPositionEnum = z.enum([
  "STAND",
  "EXPOSURE",
  "KOREAN",
  "SOFA",
  "CHEST",
  "BACK",
  "BELLY",
  "SHOULDER",
  "HANG",
  "NEVERMIND",
  "DROPKNEE",
  "DOUBLE DROP KNEE",
  "INWARD DROP KNEE",
  "LEASH",
  "KNEEHANG",
  "SOUP",
  "SIT",
  "ROCKET",
  "FRODO",
  "BUDDHA",
  "YISUS",
  "BANANA",
]);

export type Position = z.infer<typeof ZodPositionEnum>;
