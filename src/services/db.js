import Dexie from "dexie";
import Papa from "papaparse"
import { predefinedTricks, predefinedTricksVersion } from "../predefinedTricksCombos"
import { predefinedCombos, predefinedCombosVersion } from "../predefinedTricksCombos"
import { persist, tryPersistWithoutPromtingUser } from "./persistentStorage"
import IDBExportImport from 'indexeddb-export-import';
import fileDownload from 'js-file-download';


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

    this.db.version(7).stores().upgrade(tx => {
      return tx.table("predefinedTricks").toArray().then(preTricks => {
        return tx.table("userTricks").toCollection().modify(userTrick => {
          const preTrick = preTricks.filter(trick => trick.id === userTrick.id)[0];
          Object.keys(userTrick).forEach(key => {
            if (key in preTrick && key !== "id" && userTrick[key] === preTrick[key]) {
              console.log("deleting ", userTrick.id, key)
              delete userTrick[key];
            }
          });
        });
      });
    });

    this.db.version(8).stores({
      predefinedTricks: "id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,stickFrequency,*recommendedPrerequisites,boostSkill",
      userTricks: "++id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,stickFrequency,*recommendedPrerequisites,deleted,boostSkill",
    }).upgrade(async tx => {
      await tx.table("predefinedTricks").toCollection().modify(trick => {
        if (!Array.isArray(trick.tips)) {
          trick.tips = trick.tips ? trick.tips.split(";") : [];
        }
      });
      await tx.table("userTricks").toCollection().modify(trick => {
        if (!Array.isArray(trick.tips)) {
          trick.tips = trick.tips ? trick.tips.split(";") : [];
        }
      });
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

  /**
   * Populate the database with the trick of the predefinedTricks.js file.
   * @returns {Promise<void>}
   */
  populateTricks = async () => {
    await this.db.predefinedTricks.clear();

    const trickList = Papa.parse(predefinedTricks, {dynamicTyping: true}).data;

    const header = trickList.shift();
    const tricks = trickList.map(trick => {
      return Object.assign.apply({}, header.map((v, i) => ({[v]: trick[i]})));
    });

    for(const trick of tricks) {
      trick.stickFrequency = 0;
      trick.recommendedPrerequisites = normalizeTrickPrerequisites(trick.recommendedPrerequisites);
      trick.tips = trick.tips ? trick.tips.split(";") : [];
    }

    await this.db.predefinedTricks.bulkPut(tricks);
    await this.db.versions.put({"key": "predefinedTricksVersion", "version": predefinedTricksVersion});
  };

  // helper function to combine two lists, 
  // where entries which share the same keys, get merged 
  // and atributes of the first list are prefered
  mergeLists = (listA, listB) => {
    if (listA && !listB) return listA;
    if (!listA && listB) return listB;
    if (!listA && !listB) return null;
    // Merge the two lists based on the common "id" attribute 
    return listA.map((objA) => {
      const objB = listB.find((objB) => objB.id === objA.id);
      if (objB) {
        // Combine the attributes of listA and listB, removing duplicates from listB
        const objBcopy = { ...objB };
        Object.keys(objA).forEach((key) => {
          if (key in objB) {
            delete objBcopy[key];
          }
        });
        return { ...objA, ...objBcopy };
      } else {
        // If the id is unique keep it as is
        return objA;
      }
    }).concat(listB.filter((objB) => !listA.some((objA) => objA.id === objB.id)))
  };

  // get single trick by id
  getTrick = (id) => this.db.userTricks.get(Number(id)).then(userTrick => {
      return this.db.predefinedTricks.get(Number(id)).then(preTrick => {
        // overwrite all user set attributes
        return {...preTrick, ...userTrick};
      });
    });

  /**
   * Get a list of all tricks. All Tricks from both of the tables are combined by their ids. If an entry exists in
   * both tables, the one from the userTricks table is used.
   */
  getAllTricks = async () => {
    const[userTricks, preTricks] = await Promise.all([
      await this.db.userTricks.toArray(),
      await this.db.predefinedTricks.toArray(),
    ]);
    return this.mergeLists(userTricks, preTricks)
        .filter(trick => !trick.deleted)
        .sort((a,b) => a.id - b.id);
  };

  /**
   * Provided a list of trick ids, a list of tricks is returned which has the same number of elements and the same order
   * as the original list.
   */
  getTricksByIds = async (ids) => {
    const allTrickInfo = await this.getAllTricks()
    const allTrickLookup = {}
    allTrickInfo.forEach(e => allTrickLookup[e.id] = e)

    const tricks = []
    for (let i = 0; i < ids.length; i++) {
      if (Object.keys(allTrickLookup).includes("" + ids[i])) {
        tricks.push(allTrickLookup[ids[i]])
      } else {
        throw new Error(`Id '${ids[i]}' not in database.`)
      }
    }
    return tricks
  };


  getTricksByDiffAndByFreq = (diffLevels, stickFreqs) => {
    return this.getAllTricks().then(tricks => {
      return tricks.filter(trick => {
        return (diffLevels.includes(trick.difficultyLevel) && stickFreqs.includes(trick.stickFrequency));
      });
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

  /**
   * Fill a combo, which has only ids as tricks with the full tricks (containing id, name, level, etc.)
   */
  fillComboWithTricks = async (combo) => {
    combo.tricks = await this.getTricksByIds(combo.tricks)
    return combo;
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

  // export data
  exportDatabase = () => {
    return this.db.open().then(() => {
      const idbDatabase = this.db.backendDB(); // get native IDBDatabase object from Dexie wrapper

      // export to JSON, clear database, and import from JSON
      IDBExportImport.exportToJsonString(idbDatabase, function(err, jsonString) {
        if (err) {
          console.error(err);
        } else {
          console.log('Exported as JSON: ' + jsonString);
          const date = new Date();
          fileDownload(jsonString, "highline-freestyle.com".concat(date.toLocaleDateString().replaceAll("/","-"), ".json"));
        }
      });
    }).catch(function(e) {
      console.error('Could not connect. ' + e);
    });
  };

  // import data
  importDatabase = (data) => {
    return this.db.open().then(() => {
      const idbDatabase = this.db.backendDB(); // get native IDBDatabase object from Dexie wrapper

      IDBExportImport.clearDatabase(idbDatabase, function(err) {
        if (!err) {
          IDBExportImport.importFromJsonString(idbDatabase, data, function(err) {
            if (!err) {
              console.log('Imported data successfully');
             // Dexie.on("storagemutated").fire(ObservabilitySet);
            }
          });
        }
      });
    }).catch(function(e) {
      console.error('Could not connect. ' + e);
    });
  };

}

/**
 * Takes the recommended prerequisites of a trick as either a number or a semicolon separated string and returns it
 * / them as an array of numbers (ids). If the prerequisites are of any other type, they are simply returned as they
 * are. If undefined or null is passed, an empty array is returned.
 */
function normalizeTrickPrerequisites(prerequisites) {
  if (!prerequisites) {
    return [];
  }
  if (typeof prerequisites === "string") {
    return prerequisites.split(";").map(string => Number(string));
  }
  if (typeof prerequisites === "number") {
    return [prerequisites];
  }
  return prerequisites;
}
