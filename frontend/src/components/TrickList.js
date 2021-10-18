import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import TricksDataService from "../services/tricks.js"

const TrickList = () => {

  const [tricks, setTricks] = useState([]);

  useEffect(() => {
    retrieveTricks();
  }, []);

  const retrieveTricks = () => {
    TricksDataService.getAll()
      .then(res => {
        console.log(res.data);
        setTricks(res.data.tricks);
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
              <div key={trick._id}>
                <Link className="link-to-trick " to={`/tricks/${trick._id}`} key={trick._id} >
                  <button className=" btn btn-outline-success trick-preview" freq={trick.stickFrequency}>
                    <h2>{trick.name}</h2>
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
