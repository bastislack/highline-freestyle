import {Transaction} from "dexie";

// No change since v4
export const schema = {
  // to keep track of all the versions
  versions: "key,version",
  // this is the table for the "predefined" tricks, the id's will start from 10000 onwards
  predefinedTricks:
    "id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,tips,stickFrequency,*recommendedPrerequisites,boostSkill",
  userTricks:
    "++id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,tips,stickFrequency,*recommendedPrerequisites,deleted,boostSkill",
  predefinedCombos:
    "id, name, *tricks, minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks, establishedBy, yearEstablished, linkToVideo, comments, stickFrequency, boostSkill",
  userCombos:
    "++id, name, *tricks, minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks, establishedBy, yearEstablished, linkToVideo, comments, stickFrequency, deleted, boostSkill",
};

export function upgrade(tx: Transaction) {
  tx.table("userTricks")
    .toCollection()
    .modify((trick: any) => {
      if (trick.stickFrequency === 5 || trick.stickFrequency === 6) {
        trick.stickFrequency++;
      }
    });
}

export default {schema, upgrade};
