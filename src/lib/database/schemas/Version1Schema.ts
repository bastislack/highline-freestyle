import { Transaction } from "dexie"
import {z} from "zod"


export const DbPositionZod = z.enum([
  "Stand",
  "Exposure",
  "Korean",
  "Sofa",
  "Chest",
  "Back",
  "Belly",
  "Shoulder",
  "Hang",
  "Nevermind",
  "Dropknee",
  "Double Drop Knee",
  "Inward Drop Knee",
  "Leash",
  "Kneehang",
  "Soup",
  "Sit",
  "Rocket",
  "Frodo",
  "Buddha",
  "Yisus",
  "Banana",
])


export const DbStickableStatusZod = z.enum(["official", "userDefined", "archived"])


// [id, trickStatus] OR [id, comboStatus]
const DbReferenceZod = z.tuple([z.number().int(), DbStickableStatusZod])


const DbVideoZod = z.object({
  link: z.string().nonempty().url(),
  startTime: z.number().min(0).optional(),
  endTime: z.number().min(0).optional()
})

const CommonDefinition = {
  id: z.number().int(),
  establishedBy: z.string().nonempty().optional(),
  yearEstablished: z.number().int().positive().optional(),
  description: z.string().nonempty().optional(),
  tips: z.array(z.string().nonempty()).optional(),
  dateAddedEpoch: z.number().int().min(0),
  videos: z.array(DbVideoZod).optional()
} as const

export const DbTricksTableZod = z.object({
  ...CommonDefinition,
  trickStatus: DbStickableStatusZod,
  technicalName: z.string().nonempty(),
  alias: z.string().nonempty().optional(),
  startPosition: DbPositionZod,
  endPosition: DbPositionZod,
  difficultyLevel: z.number().int().min(0),
  recommendedPrerequisites: z.array(DbReferenceZod).optional(),
  variationOf: z.array(DbReferenceZod).optional(),
  showInSearchQueries: z.boolean()
})

export const DbCombosTableZod = z.object({
  ...CommonDefinition,
  comboStatus: DbStickableStatusZod,
  name: z.string().nonempty(),
  tricks: z.array(DbReferenceZod).nonempty()
})

export const DbMetadataZod = z.object({
  id: z.number().int(),
  entityStatus: DbStickableStatusZod,
  entityCategory: z.enum(["Combo", "Trick"]),
  stickFrequency: z.enum([""]).optional(),
  isFavourite: z.boolean().default(false),
  notes: z.string().optional()
})


/**
 * This method is invoked to migrate from the previous version schema.
 * 
 * This is a NOOP for this particular Version (because there is no previous version, so you cannot really do a migration)
 */
export async function update(_tx: Transaction) {
  return;
}

export const schema = {
  tricks: "[id+trickStatus], technicalName, alias, establishedBy, yearEstablished, startPosition, endPosition, difficultyLevel, description, *recommendedPrerequisites, tips, *variationOf, showInSearchQueries, dateAddedEpoch, videos",
  combos: "[id+comboStatus], name, establishedBy, yearEstablished, *tricks, description, tips, dateAddedEpoch, videos",
  metadata: "[id+entityStatus+entityCategory], stickFrequency, isFavourite, notes"
} as const