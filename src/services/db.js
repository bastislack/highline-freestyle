import Dexie from "dexie";
import Papa from "papaparse"
import { tricklist } from "../tricklist"


export default class Database {

  constructor() {

    this.db = new Dexie("db");

    this.db.version(1).stores({
      tricks: "id, alias, technicalName, establishedBy, yearEstablished, linkToVideo, startPos, endPos, difficultyLevel, description, tips",
      combos: "++id, name"
    });

    // count the tricks in the database and populate it if its empty
    this.db.tricks.count().then((count) => {
      if (count === 0) {
        this.populateTricks();
      } else {
        console.log("there are already " + count + " tricks in the database");
      }
    }); 
  }

  populateTricks = () => {
    const trickList = Papa.parse(tricklist).data;

    // this uses the labels of the csv but, also adds an id
    const header = ["id"].concat(trickList.shift());

    const tricks = Array(trickList.length);
    for (let i=0; i < trickList.length; i++) {
      // add the id 
      const trick = [i].concat(trickList[i]);
      // make key value pairs
      const rightFormatTrick = Object.assign.apply({}, 
        header.map((v,i) => ({
          [v]: trick[i]
        }))
      );
      tricks[i] = rightFormatTrick;
    }

    // adds the tricks to the database
    this.db.tricks.bulkPut(tricks).then(() => 
      console.log("added tricks to database from the csv")
    );
  }

  // get single trick by id
  get = (id) => {
    return this.db.tricks.get(id);
  };

  // get list of all tricks
  getAll = () => {
    return this.db.tricks.toArray();
  };

  // create or update trick
  saveTrick = (obj) => {
    return this.db.tricks.put(obj);
  };

  // delete trick
  deleteTrick = (id) => {
    return this.db.tricks.delete(id);
  };
}
