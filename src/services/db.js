import Dexie from "dexie";
import Papa from "papaparse"
import { predefinedTricks, predefinedTricksVersion } from "../predefinedTricksCombos"
import { predefinedCombos, predefinedCombosVersion } from "../predefinedTricksCombos"
import { persist, tryPersistWithoutPromtingUser } from "./persistentStorage"


export default class Database {

  constructor(testSetupCallback = null) {
    this.db = testSetupCallback === null ? new Dexie("db") : testSetupCallback();

    this.db.version(4).stores({
      // to keep track of all the versions
      versions: "key,version",
      // this is the table for the "predefined" tricks, the id's will start from 10000 onwards
      predefinedTricks: "id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,tips,stickFrequency,*recommendedPrerequisites,boostSkill",
      userTricks: "++id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,tips,stickFrequency,*recommendedPrerequisites,deleted,boostSkill",
      predefinedCombos: "id, name, *tricks, minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks, establishedBy, yearEstablished, linkToVideo, comments, stickFrequency, boostSkill",
      userCombos: "++id, name, *tricks, minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks, establishedBy, yearEstablished, linkToVideo, comments, stickFrequency, deleted, boostSkill"
    });
    this.db.version(5).stores().upgrade(tx => {
      return tx.table("userTricks").toCollection().modify(trick => {
        if (trick.stickFrequency === 5 || trick.stickFrequency === 6) {
          trick.stickFrequency += 1;
        }
      })
    });

    this.db.version(6).stores().upgrade(tx => {
      return tx.table("userCombos").toCollection().modify(combo => {
        if (combo.stickFrequency === 5 || combo.stickFrequency === 6) {
          combo.stickFrequency += 1;
        }
      })
    });

    this.db.on('ready', () => {
      // count the tricks in the database and populate it if its empty
      return this.db.versions.get("predefinedTricksVersion").then(ret => {
        if (!ret || ret.version < predefinedTricksVersion) {
          return this.populateTricks();
        } else {
          console.log("did not update predefinedTricks");
        }
      }).then(() => {
        // count the combos in the database and populate it if its empty
        return this.db.versions.get("predefinedCombosVersion").then( ret => {
          if (!ret || ret.version < predefinedCombosVersion) {
            return this.populateCombos();
          } else {
            console.log("did not update predefinedCombos");
          }
        });
      });
    });

    // try silently to persist the storage, othewise prompt when adding something to the db
    this.persistentStorage = tryPersistWithoutPromtingUser();
  }

  // Tricks

  // clear userTricks
  dropUserTricks = () => {
    return this.db.userTricks.clear();
  };

  // populate the databes with tricks from the predefinedTricks.js
  populateTricks = () => {
    return this.db.predefinedTricks.clear().then(() => {
      console.log("updating predefinedTricks")
      const trickList = Papa.parse(predefinedTricks, {dynamicTyping: true}).data;

      // this uses the labels of the csv but, also adds an id
      const header = trickList.shift().concat(["stickFrequency"]);

      const tricks = trickList.map(trick => {
        // add 0 for stickFrequency
        trick.push(0);
        // make key value pairs
        return Object.assign.apply({},
          header.map((v,i) => {
            return ({[v]: trick[i]})
          })
      );});

      //this turns the list of recommendedPrerequisites (which are separated by an ;) into an Array
      tricks.map(trick => {
        if (typeof trick.recommendedPrerequisites === "string") {
          trick.recommendedPrerequisites = trick.recommendedPrerequisites.split(";").map(string => Number(string));
        } else if (typeof trick.recommendedPrerequisites === "number") {
          trick.recommendedPrerequisites = [trick.recommendedPrerequisites];
        }
      });

      // adds the tricks to the database
      return this.db.predefinedTricks.bulkPut(tricks).then(() => {
        console.log("added tricks to database from the csv");
        this.db.versions.put({"key": "predefinedTricksVersion", "version": predefinedTricksVersion});
      });
    });
  };

  // get single trick by id
  getTrick = (id) => this.db
    .userTricks
    .get(Number(id))
    .then(userTrick => {
      if (userTrick && !userTrick.deleted) return userTrick;
      else return this.db.predefinedTricks.get(Number(id)
    );
  });

  // get list of all tricks
  getAllTricks = () => {
    return this.db.userTricks.toArray().then((userTricks) => {
      const userKeys = userTricks.map(trick => trick.id);
      // query all only predefinedTricks which don't have the same id as the userTricks
      // and concat these to the userTricks
      // also filter out tricks which are marked deleted
      return this.db
        .predefinedTricks
        .where("id")
        .noneOf(userKeys)
        .toArray()
        .then(preTricks =>
          preTricks
            .concat(userTricks.filter(trick => !trick.deleted))
            .sort((a,b) => a.id - b.id)
        );
    });
  };

  // get list of all tricks
  getTricksByIds = (ids) => {
    let result = [];
    for (let i = 0; i < ids.length; i++) {
      result.push(
        this.db.userTricks.where("id").equals(ids[i]).last().then((userTrick) => {
          if (userTrick && !userTrick.deleted) {
            return userTrick;
          } else {
            return this.db.predefinedTricks.where("id").equals(ids[i]).last();
          }
        })
      );
    }
    return result;
  };

  getTricksByDiffAndByFreq = (diffLevels, stickFreqs) => {
    return this.db.userTricks.toArray().then(userTricks => {
      userTricks = userTricks.filter(trick => { return ((diffLevels.includes(trick.difficultyLevel) && stickFreqs.includes(trick.stickFrequency)) || trick.deleted);});
      return this.db.predefinedTricks.where("difficultyLevel").anyOf(diffLevels).and(trick => stickFreqs.includes(trick.stickFrequency)).and(trick => !userTricks.map(trick => trick.id).includes(trick.id)).toArray().then(preTricks => preTricks.concat(userTricks.filter(trick => !trick.deleted)));
    });
  };

  // create or update userTrick
  saveTrick = (trick) => {
    // if needing to prompt for persistence prompt now
    persist();

    if (trick.recommendedPrerequisites) {
      // replace recTricks by their id
      trick.recommendedPrerequisites = trick.recommendedPrerequisites.map(recTrick => recTrick.id);
    }
    if (trick.id) return this.db.userTricks.put(trick);
    else {
      return this.db.predefinedTricks.toCollection().primaryKeys().then( (trickKeys) => {
        this.db.userTricks.toCollection().primaryKeys().then( userTrickKeys => {
          const keysSet = new Set(trickKeys.concat(userTrickKeys));
          for (var key = 1; key < 10000; key++) {
            if (!keysSet.has(key)) {
              trick.id = key;
              this.db.userTricks.put(trick)
              break;
            }
          }
        })
      });
    }
  };

  // delete trick
  deleteTrick = (id) => this.db.userTricks.put({"id": Number(id), deleted: true});


  // Combos

  // clear userCombos
  dropUserCombos = () => {
    return this.db.userCombos.clear();
  };

  // populate the databes with combos from the predefinedCombos.js
  populateCombos = () => {
    return this.db.predefinedCombos.clear().then(() => {
      return this.getAllTricks().then(allTricks => {
        console.log("updating predefinedCombos")
        const comboList = Papa.parse(predefinedCombos, {dynamicTyping: true}).data;

        // this uses the labels of the csv but, also adds an id
        const header = comboList.shift().concat(["stickFrequency"]);

        const combos = comboList.map(combo => {
          // convert string of tricks to an array of numbers
          combo[2] = combo[2].split(";").map(idStr => Number(idStr));
          // add 0 for stickFrequency
          combo.push(0);
          // make key value pairs
          return Object.assign.apply({},
            header.map((v,i) => {
              return ({[v]: combo[i]})
            })
          )
        });

        // adds the combos to the database
        return this.db.predefinedCombos.bulkPut(combos).then(() => {
          console.log("added combos to database from the csv");
          return this.db.versions.put({"key": "predefinedCombosVersion", "version": predefinedCombosVersion});
        });
      });
    });
  };

  // get single combo by id
  getCombo = (id) => this.db
    .userCombos
    .get(Number(id))
    .then(userCombo => {
      if (userCombo) return userCombo;
      else return this.db.predefinedCombos.get(Number(id));
    })
    .then(combo => this.fillComboWithTricks(combo));

  // fill a combo, which has only ids as tricks with the full tricks
  // (containing id, name, level, etc.)
  fillComboWithTricks = (combo) => {
    return Promise.all(this.getTricksByIds(combo.tricks))
      .then(tricksInCombo => {
        combo.tricks = tricksInCombo;
        return combo;
      });
  };

  // get list of all combos
  getAllCombos = () => {
    return this.db.userCombos.toArray().then((userCombos) => {
      const userKeys = userCombos.map(combo => combo.id);
      // query all only predefinedCombos which don't have the same id as the userCombos
      // and concat these to the userCombos
      // also filter out combos which are marked deleted
      return this.db.predefinedCombos.where("id").noneOf(userKeys).toArray().then(preCombos => preCombos.concat(userCombos.filter(combo => !combo.deleted)));
    });
  };

  // create or update userCombo
  saveCombo = (combo) => {
    // if needing to prompt for persistence prompt now
    persist();

    combo.tricks = combo.tricks.map(trick => trick.id);
    if (combo.id) {
      return this.db.userCombos.put(combo);
    }
    else {
      return this.db.predefinedCombos.toCollection().primaryKeys().then( (comboKeys) => {
        this.db.userCombos.toCollection().primaryKeys().then( userComboKey => {
          const keysSet = new Set(comboKeys.concat(userComboKey));
          for (var key = 1; key < 10000; key++) {
            if (!keysSet.has(key)) {
              combo.id = key;
              if (isNaN(combo.tricks[0])) {
                const trickNumbers = combo.tricks.map(trick => trick.id);
                var comboWithNumbers = combo;
                comboWithNumbers.tricks = trickNumbers;
                this.db.userCombos.put(comboWithNumbers);
              }
              else this.db.userCombos.put(combo);
              break;
            }
          }
        })
      });
    }
  };

  // delete combo
  deleteCombo = (id) => this.db.userCombos.put({"id": Number(id), deleted: true});
}
