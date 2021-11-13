import { Link } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../../services/db";
const db = new Database();

const TrickList = ({ sortingSchemes, sortOpt }) => {

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) {return null} else console.log(tricks);


  let current;

  return (
    <div className="justify-content-evenly">

      <div className="row">
        {tricks.map(trick => {

          let isFirst = (sortingSchemes[sortOpt].attributeFunc(trick) !== current);
          current = sortingSchemes[sortOpt].attributeFunc(trick);

          return (
            <div key={trick.id}>
              {isFirst && sortingSchemes[sortOpt].showCategory && <h5>{sortingSchemes[sortOpt].catName} {current}</h5>}
              <div>
                <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
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
