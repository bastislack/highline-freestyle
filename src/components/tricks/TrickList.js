import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../../services/db";
const db = new Database();

const TrickList = ({ sortingSchemes, sortOpt, scrollPosition, setScrollPosition }) => {

  useEffect(() => {
    window.scrollTo({
        top: scrollPosition,
        left: 0,
        behavior: 'smooth'
    });
    });

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) { return null } else console.log(tricks);

  const updateScrollPosition = () => {
    setScrollPosition(window.scrollY);
  }

  function getTrickDiv(trick) {
    return (
      <div key={trick.id} className="trick-container col-4 col-lg-3 col-xl-2">
        <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
          <button className=" btn trick-preview skillFreq" freq={trick.stickFrequency} onClick={updateScrollPosition}>
            {trick.alias || trick.technicalName}
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
export default TrickList;
