import {Combo} from "../../../../types/combo";
import {stickFrequencyFromLegacy, stickFrequencyToLegacy} from "../../../../types/enums";
import {PredefinedCombosTable} from "../../schemas/CurrentVersion";

export function comboToComboTable(e: Combo) {
  const returnObject: PredefinedCombosTable = {
    id: e.id,
    name: e.name,
    tricks: e.tricks,
    minDiff: e.minDiff,
    maxDiff: e.maxDiff,
    avgDiff: e.avgDiff,
    totalDiff: e.totalDiff,
    numberOfTricks: e.numberOfTricks,
    establishedBy: e.establishedBy,
    yearEstablished: e.yearEstablished,
    linkToVideo: e.linkToVideo, // TODO: Why no videoStart, videoEnd
    comments: e.comments,
    stickFrequency: stickFrequencyToLegacy(e.stickFrequency ?? "Never Tried"),
    boostSkill: false,
  };
  return returnObject;
}

export function comboTableToCombo(e: PredefinedCombosTable) {
  const returnObject: Combo = {
    id: e.id,
    name: e.name,
    tricks: e.tricks,
    minDiff: e.minDiff,
    maxDiff: e.maxDiff,
    avgDiff: e.avgDiff,
    totalDiff: e.totalDiff,
    numberOfTricks: e.numberOfTricks,
    establishedBy: e.establishedBy!,
    yearEstablished: e.yearEstablished,
    linkToVideo: e.linkToVideo, // TODO: Why no videoStart, videoEnd
    comments: e.comments,
    stickFrequency: stickFrequencyFromLegacy(e.stickFrequency ?? 0),
  };
  return returnObject;
}
