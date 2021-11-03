import { Link } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const TrickList = () => {

  // tricks query with react hooks -- means it refreshes automaticly
  const tricks = useLiveQuery(() => db.getAllTricks(), []);
  if (!tricks) {return null} else console.log(tricks);

  let previousDifficultyLevel = 0;

  return (
    <div className="justify-content-evenly">

      <div className="row">
        {tricks.map(trick => {
          let isFirstOfLevel = false;

          if (trick.difficultyLevel === previousDifficultyLevel) {
            isFirstOfLevel = false;
          } else {
            isFirstOfLevel = true;
          }

          previousDifficultyLevel = trick.difficultyLevel

          return (
            <div key={trick.id}>
              {isFirstOfLevel && <div>Level {trick.difficultyLevel}</div>}
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
