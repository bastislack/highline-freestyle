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

  return (
    <div className="justify-content-evenly">

      <div className="row">
      {tricks.map(trick => (
          <Link className="col-md-4 link-to-trick " to={`/tricks/${trick._id}`} key={trick._id} >
            <button className=" btn btn-outline-success trick-preview" freq={trick.stickFrequency}>
              <h2>{ trick.alias || trick.technicalName }</h2>
            </button>
          </Link>
      ))}
    </div>
    </div>
  );
}

export default TrickList;
