import { Link } from 'react-router-dom';
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const TrickList = () => {

  const [sortOpt, setSortOpt] = useState("levelUp");

  // the schemes with the sorting function, the sorting name and a function to the attribute
  const schemes = {
    "levelUp": {
      "sortFunc": (a, b) => (a.difficultyLevel - b.difficultyLevel),
      "name": "Level",
      "attributeFunc": (a) => a.difficultyLevel,
      "showCategory": true,
    },
    "levelDown": {
      "sortFunc": (a, b) => (b.difficultyLevel - a.difficultyLevel),
      "name": "Level",
      "attributeFunc": (a) => a.difficultyLevel,
      "showCategory": true,
    },
    "stickUp": {
      "sortFunc": (a, b) => {if (a.stickFrequency) return (a.stickFrequency - b.stickFrequency);return 0.1;},
      "name": "StickFrequency",
      "attributeFunc": (a) => a.stickFrequency,
      "showCategory": false,
    },
    "stickDown": {
      "sortFunc": (a, b) => {if (a.stickFrequency) return (b.stickFrequency - a.stickFrequency);return 1;},
      "name": "StickFrequency",
      "attributeFunc": (a) => a.stickFrequency,
      "showCategory": false,
    },
  };

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(schemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) {return null} else console.log(tricks);


  let current;

  return (
    <div className="justify-content-evenly">

      <div className="row">
        {tricks.map(trick => {

          let isFirst = (schemes[sortOpt].attributeFunc(trick) !== current);
          current = schemes[sortOpt].attributeFunc(trick);

          return (
            <div key={trick.id}>
              {isFirst && schemes[sortOpt].showCategory && <div>{schemes[sortOpt].name} {current}</div>}
              <div>
                <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={trick.id} >
                  <button className=" btn btn-outline-success trick-preview skillFreq" freq={trick.stickFrequency}>
                    <h2>{trick.alias || trick.technicalName}</h2>
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrickList;
