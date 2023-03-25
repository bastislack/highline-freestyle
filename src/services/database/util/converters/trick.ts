/**
 * This util Module is for converting between Trick and *TrickTable
 */
import {stickFrequencyToLegacy} from "../../../../types/enums";
import {Trick} from "../../../../types/trick";
import {PredefinedTricksTable} from "../../schemas/Version8Schema";

export function trickTableToTrick(table: PredefinedTricksTable): Trick {
  return {
    id: table.id,
    alias: table.alias,
    technicalName: table.technicalName,
    establishedBy: table.establishedBy,
    yearEstablished: table.yearEstablished,
    linkToVideo: table.linkToVideo,
    videoStartTime: table.videoStartTime,
    videoEndTime: table.videoStartTime,
    startPos: table.startPos,
    endPos: table.endPos,
    difficultyLevel: table.difficultyLevel,
    description: table.description,
    tips: table.tips ?? [],
    //stickFrequency: stickFrequencyFromLegacy(table.stickFrequency),
    recommendedPrerequisiteIds: table.recommendedPrerequisites ?? [],
    //boostSkill: false
  };
}

export function trickToTrickTable(trick: Trick): PredefinedTricksTable {
  // This is "strong-typed" intentionally to catch errors when the API Changes
  const trickTable: PredefinedTricksTable = {
    id: trick.id,
    alias: trick.alias,
    technicalName: trick.technicalName,
    establishedBy: trick.establishedBy,
    yearEstablished: trick.yearEstablished,
    linkToVideo: trick.linkToVideo,
    videoStartTime: trick.videoStartTime,
    videoEndTime: trick.videoStartTime,
    startPos: trick.startPos,
    endPos: trick.endPos,
    difficultyLevel: trick.difficultyLevel,
    description: trick.description,
    tips: trick.tips ?? [],
    stickFrequency: stickFrequencyToLegacy("Never Tried"), // TODO:
    recommendedPrerequisites: trick.recommendedPrerequisiteIds ?? [],
    boostSkill: false,
  };

  return trickTable;
}
