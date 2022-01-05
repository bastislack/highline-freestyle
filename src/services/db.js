import Dexie from "dexie";
import Papa from "papaparse"
import { predefinedTricks, predefinedTricksVersion } from "../predifinedTricksCombos"
import { predefinedCombos, predefinedCombosVersion } from "../predifinedTricksCombos"


export default class Database {

  constructor() {

    this.db = new Dexie("db");

    this.db.version(2).stores({
      // to keep track of all the versions
      versions: "key,version",
      // this is the table for the "predefined" tricks, the id's will start from 10000 onwards
      predefinedTricks: "id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,tips,stickFrequency",
      userTricks: "++id,alias,technicalName,establishedBy,yearEstablished,linkToVideo,videoStartTime,videoEndTime,startPos,endPos,difficultyLevel,description,tips,stickFrequency,deleted",
      predefinedCombos: "id, name, *tricks, minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks, establishedBy, yearEstablished, linkToVideo, comments, stickFrequency",
      userCombos: "++id, name, *tricks, minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks, establishedBy, yearEstablished, linkToVideo, comments, stickFrequency, deleted"
    });

    // count the tricks in the database and populate it if its empty
    this.db.versions.get("predefinedTricksVersion").then( ret => {
      if (!ret || ret.version < predefinedTricksVersion) {
        this.populateTricks();
      } else {
        console.log("did not update predefinedTricks");
      }
    }).then(() => {
      // count the combos in the database and populate it if its empty
      this.db.versions.get("predefinedCombosVersion").then( ret => {
        if (!ret || ret.version < predefinedCombosVersion) {
          this.populateCombos();
        } else {
          console.log("did not update predefinedCombos");
        }
      }); 
    });
  }

  // Tricks

  // clear userTricks
  dropUserTricks = () => {
    return this.db.userTricks.clear();
  };

  // populate the databes with tricks from the predefinedTricks.js
  populateTricks = () => {
    this.db.predefinedTricks.clear().then(() => {
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

      // adds the tricks to the database
      this.db.predefinedTricks.bulkPut(tricks).then(() => {
        console.log("added tricks to database from the csv");
        this.db.versions.put({"key": "predefinedTricksVersion", "version": predefinedTricksVersion});
      });
    });
  };

  // get single trick by id
  getTrick = (id) => this.db.userTricks.get(Number(id)).then(userTrick => {
    if (userTrick) return userTrick;
    else return this.db.predefinedTricks.get(Number(id));
  });

  // get list of all tricks
  getAllTricks = () => {
    return this.db.userTricks.toArray().then((userTricks) => {
      const userKeys = userTricks.map(trick => trick.id);
      // query all only predefinedTricks which don't have the same id as the userTricks
      // and concat these to the userTricks
      // also filter out tricks which are marked deleted
      return this.db.predefinedTricks.where("id").noneOf(userKeys).toArray().then(preTricks => preTricks.concat(userTricks.filter(trick => !trick.deleted)));
    });
  };

  // get list of all tricks
  getTricksByIds = (ids) => {
    return this.db.userTricks.where("id").anyOf(ids).toArray().then((userTricks) => {
      const userKeys = userTricks.map(trick => trick.id);
      // query all only predefinedTricks which don't have the same id as the userTricks
      // and concat these to the userTricks
      // also filter out tricks which are marked deleted
      return this.db.predefinedTricks.where("id").anyOf(ids).and(trick => !userKeys.includes(trick.id)).toArray().then(preTricks => preTricks.concat(userTricks.filter(trick => !trick.deleted)));
    });
  };

  // get list of tricks by difficulty and stickFrequency
  getTricksByDiffAndByFreq = (diffLevels, stickFreqs) => {
    return this.db.userTricks.filter((trick) => { return (stickFreqs.includes(trick.stickFrequency) && diffLevels.includes(trick.difficultyLevel));}).toArray().then((userTricks) => {
      const userKeys = userTricks.map(trick => trick.id);
      // query all only predefinedTricks which don't have the same id as the userTricks
      // and concat these to the userTricks
      // also filter out tricks which are marked deleted
      return this.db.predefinedTricks.filter((trick) => { return (stickFreqs.includes(trick.stickFrequency) && diffLevels.includes(trick.difficultyLevel));}).and(trick => !userKeys.includes(trick.id)).toArray().then(preTricks => preTricks.concat(userTricks.filter(trick => !trick.deleted)));
    });
  };

  // create or update userTrick
  saveTrick = (trick) => this.db.userTricks.put(trick);

  // delete trick
  deleteTrick = (id) => this.db.userTricks.put({"id": Number(id), deleted: true});


  // Combos

  // clear userCombos
  dropUserCombos = () => {
    return this.db.userCombos.clear();
  };

  // populate the databes with combos from the predefinedCombos.js
  populateCombos = () => {
    this.db.predefinedCombos.clear().then(() => {
      this.getAllTricks().then(allTricks => {
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
        this.db.predefinedCombos.bulkPut(combos).then(() => {
          console.log("added combos to database from the csv");
          this.db.versions.put({"key": "predefinedCombosVersion", "version": predefinedCombosVersion});
        });
      });
    });
  };

  // get single combo by id
  getCombo = (id) => this.db.userCombos.get(Number(id)).then(userCombo => {
    if (userCombo) return userCombo;
    else return this.db.predefinedCombos.get(Number(id));
  }).then(combo => this.fillComboWithTricks(combo));

  // fill a combo, which has only ids as tricks with the tricks
  fillComboWithTricks = (combo) => {
    return this.getTricksByIds(combo.tricks).then(tricksInCombo => {
      let comboWithTricks = combo;
      // change the order of the tricks to the original one
      comboWithTricks.tricks = tricksInCombo.sort((a,b) => combo.tricks.indexOf(a.id) - combo.tricks.indexOf(b.id));
      return comboWithTricks;
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
    if (isNaN(comob.tricks[0])) {
      const trickNumbers = combo.tricks.map(trick => trick.id);
      var comboWithNumbers = combo;
      comboWithNumbers.tricks = trickNumbers;
      return this.db.userCombos.put(comboWithNumbers);
    }
    else return this.db.userCombos.put(combo);
  };

  // delete combo
  deleteCombo = (id) => this.db.userCombos.put({"id": Number(id), deleted: true});
}
