import { Link } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../../services/db";
const db = new Database();

const TrickList = ({ sortingSchemes, sortOpt }) => {

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) { return null } else console.log(tricks);

  function getTrickDiv(trick) {
    return (
      <div key={trick.id} className="trick-container col-6 col-lg-4 col-xl-2">
        <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
          <button className=" btn btn-outline-success trick-preview skillFreq" freq={trick.stickFrequency}>
            <h3>{trick.alias || trick.technicalName}</h3>
          </button>
        </Link>
      </div>)
  }

  let current;

  return (
    <div className="justify-content-evenly">

      <div className="row">
        {tricks.map(trick => {
          let isFirst = (sortingSchemes[sortOpt].attributeFunc(trick) !== current);
          current = sortingSchemes[sortOpt].attributeFunc(trick);

          if (isFirst && sortingSchemes[sortOpt].showCategory) {
            return [
              <div className="w-100 list-br-heading" key={"header" + trick.id.toString()}>
                <h4>{sortingSchemes[sortOpt].catName} {current}</h4>
              </div>,
              getTrickDiv(trick)
            ];
          } else {
            return (
              getTrickDiv(trick)
            );
          }

        })}
      </div>
    </div>
  );
}
//{isFirst && sortingSchemes[sortOpt].showCategory && <h5>{sortingSchemes[sortOpt].catName} {current}</h5>}
export default TrickList;
