import {Transaction} from "dexie";
import {Position} from "../../../types/enums";

export interface VersionsTable {
  key: string;
  version: number;
}

export interface PredefinedTricksTable {
  id: number;
  alias?: string;
  technicalName: string;
  establishedBy?: string;
  yearEstablished?: number;
  linkToVideo?: string;
  videoStartTime?: number;
  videoEndTime?: number;
  startPos: Position;
  endPos: Position;
  difficultyLevel: number;
  description: string;
  tips: string[];
  stickFrequency?: number;
  recommendedPrerequisites?: number[];
  boostSkill?: boolean;
}

export interface UserTricksTable extends PredefinedTricksTable {
  deleted: boolean;
}

export interface PredefinedCombosTable {
  id: number;
  name: string;
  tricks: number[];
  minDiff: number;
  maxDiff: number;
  avgDiff: number;
  totalDiff: number;
  numberOfTricks: number;
  establishedBy?: string;
  yearEstablished?: number;
  linkToVideo?: string; // TODO: Why no videoStart, videoEnd
  comments?: string;
  stickFrequency?: number;
  boostSkill?: boolean;
}

export interface UserCombosTable extends PredefinedCombosTable {
  deleted: boolean;
}

export const schema = {
  predefinedTricks:
    "id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,stickFrequency,*recommendedPrerequisites,boostSkill",
  userTricks:
    "++id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,stickFrequency,*recommendedPrerequisites,deleted,boostSkill",
};

export async function upgrade(tx: Transaction) {
  await tx
    .table("predefinedTricks")
    .toCollection()
    .modify((trick) => {
      if (!Array.isArray(trick.tips)) {
        trick.tips = trick.tips ? trick.tips.split(";") : [];
      }
    });
  await tx
    .table("userTricks")
    .toCollection()
    .modify((trick) => {
      if (!Array.isArray(trick.tips)) {
        trick.tips = trick.tips ? trick.tips.split(";") : [];
      }
    });
}

export default {schema, upgrade};
