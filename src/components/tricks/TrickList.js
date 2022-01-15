import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";
import { trickSortingSchemes as sortingSchemes } from '../../services/sortingSchemes';

import Database from "../../services/db";
const db = new Database();

const TrickList = ({ sortOpt, scrollPosition, setScrollPosition, userCombo, setUserCombo }) => {

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("content").scrollTo({
        top: scrollPosition,
        left: 0,
        behavior: 'instant'
    });
  });

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) { return null } else console.log(tricks);

  const updateScrollPosition = () => {
    setScrollPosition(document.getElementById("content").scrollTop);
  }

  const onClickTrick = (trick) => {
    updateScrollPosition();
    if (location.state) {
      if (location.state.addTrickToCombo) {
        setUserCombo({...userCombo, tricks: [...userCombo.tricks, trick]});
        navigate('/postcombo');
      }
    } else {
      navigate(`/tricks/${trick.id}`);
    }
  }

  function getTrickDiv(trick) {
    return (
      <div key={trick.id} className="trick-container col-4 col-lg-3 col-xl-2">
          <button className=" btn trick-preview skillFreq" freq={trick.stickFrequency} onClick={() => onClickTrick(trick)}>
            {trick.alias || trick.technicalName}
          </button>
      </div>);
  }

  let current;

  return (
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
  );
}
export default TrickList;
