import Dexie from "dexie";
import Papa from "papaparse"
import { tricklist } from "../tricklist"


export default class Database {

  constructor() {

    this.db = new Dexie("db");

    this.db.version(1).stores({
      // this is the table for the "predefined" tricks, the id's will start from 1000 onwards
      mainTricks: "++id, alias, technicalName, establishedBy, yearEstablished, linkToVideo, startPos, endPos, difficultyLevel, description, tips",
      mainAttributes: "id, stickFrequency",
      userTricks: "++id, alias, technicalName, establishedBy, yearEstablished, linkToVideo, startPos, endPos, difficultyLevel, description, tips, strickfrequency",
      combos: "++id, name, tricks, strickfrequency, establishedBy, linkToVideo, comments, yearEstablished, stickFrequency"
    });

    // count the tricks in the database and populate it if its empty
    this.db.mainTricks.count().then((count) => {
      if (count === 0) {
        this.populateTricks();
      } else {
        console.log("there are already " + count + " tricks in the database");
      }
    }); 
  }

  dropUserTricks = () => {
    return this.db.userTricks.clear();
  };

  dropUserAtributes = () => {
    return this.db.mainAttributes.clear();
  };

  populateTricks = () => {
    this.db.mainTricks.clear().then(() => {
      const trickList = Papa.parse(tricklist).data;

      // this uses the labels of the csv but, also adds an id
      const header = ["id"].concat(trickList.shift());

      const tricks = Array(trickList.length);
      for (let i=0; i < trickList.length; i++) {
        // add the id with a 1000 offset
        const trick = [i+1000].concat(trickList[i]);
        // make key value pairs
        const rightFormatTrick = Object.assign.apply({}, 
          header.map((v,i) => ({
            [v]: trick[i]
          }))
        );
        tricks[i] = rightFormatTrick;
      }

      // adds the tricks to the database
      this.db.mainTricks.bulkPut(tricks).then(() =>
        console.log("added tricks to database from the csv")
      );
    });
  };

  // get single trick by id
  getTrick = (id) => {
    if (id < 1000) return this.db.userTricks.get(Number(id));
    return Promise.all(
      this.db.mainTricks.get(Number(id)),
      this.db.mainAttributes.get(Number(id))
    ).then((a) => {
      if (a[1]) return Object({...a[0], ...a[1]});
      return a[0];
    });
  };

  // get list of all tricks
  getAllTricks = () => {
    return Promise.all([
      Promise.all([
        this.db.mainTricks.toArray(),
        this.db.mainAttributes.toArray()
      ]).then((a) => {
        const mainTricks = a[0];
        const mainAttributes = a[1];
        if (!mainAttributes) return mainTricks;

        for (let i=0; i < mainAttributes.length; i++) {
          const index = mainTricks.findIndex((trick) => trick.id === mainAttributes[i].id);
          mainTricks[index] = Object({...mainTricks[index], ...mainAttributes[i]});
        }
        return mainTricks;
      }),
      this.db.userTricks.toArray()
    ]).then((a) => a.flat());
  };

  // create or update trick
  saveTrick = (obj) => {
    if (obj.id >= 1000) return this.db.mainTricks.put(obj);
    return this.db.userTricks.put(obj);
  };

  // delete trick
  deleteTrick = (id) => {
    if (id < 1000) console.log("can't delete this trick");
    return this.db.userTricks.delete(Number(id));
  };

  updateTrickAtributes = (obj) => {
    return this.db.mainAttributes.put(obj);
  };

  // Combos

  // get single combo by id
  getCombo = (id) => {
    return this.db.combos.get(Number(id));
  };

  // get list of all tricks
  getAllCombos = () => {
    return this.db.combos.toArray();
  };

  // create or update trick
  saveCombo = (obj) => {
    return this.db.combos.put(obj);
  };

  // delete trick
  deleteCombo = (id) => {
    return this.db.combos.delete(Number(id));
  };
}
