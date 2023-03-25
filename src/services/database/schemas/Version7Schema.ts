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
  tx.table("predefinedTricks")
    .toArray()
    .then((preTricks) =>
      tx
        .table("userTricks")
        .toCollection()
        .modify((userTrick) => {
          const preTrick = preTricks.filter((trick) => trick.id === userTrick.id)[0];
          Object.keys(userTrick).forEach((key) => {
            if (key in preTrick && key !== "id" && userTrick[key] === preTrick[key]) {
              console.log("deleting ", userTrick.id, key);
              delete userTrick[key];
            }
          });
        })
    );
}

export default {schema, upgrade};
