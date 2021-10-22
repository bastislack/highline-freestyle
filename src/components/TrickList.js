import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";

import Database from "../services/db";
const db = new Database();

const TrickList = () => {

  const [tricks, setTricks] = useState([]);

  useEffect(() => {
    retrieveTricks();
  }, []);

  const retrieveTricks = () => {
    // TODO make this work again
    db.getAll()
      .then(tricks => {
        setTricks(tricks);
      })
      .catch(e => {
        console.log(e);
      });
  };

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
            <div>
              {isFirstOfLevel && <div>Level {trick.difficultyLevel}</div>}
              <div key={trick.id}>
                <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={trick.id} >
                  <button className=" btn btn-outline-success trick-preview" freq={trick.stickFrequency}>
                    <h2>{trick.alias}</h2>
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
