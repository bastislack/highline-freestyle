import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";
import { trickSortingSchemes as sortingSchemes } from '../../services/sortingSchemes';
import computeStats from '../../logic/combos/computeStats';
import { IoRocketSharp } from 'react-icons/io5';
import Fuse from 'fuse.js';

import Database from "../../services/db";
const db = new Database();

const TrickList = ({ sortOpt, scrollPosition, setScrollPosition, userCombo, setUserCombo }) => {

  const location = useLocation();
  const navigate = useNavigate();

  let current;
  const [searchPattern, setSearchPattern] = useState("");
  const options = {
    keys: ['alias', 'technicalName']
  }
  useEffect(() => {
    document.getElementById("content").scrollTo({
        top: scrollPosition,
        left: 0,
        behavior: 'instant'
    });
  });
  const updateScrollPosition = () => {
    setScrollPosition(document.getElementById("content").scrollTop);
  }

  const addTrickToUserCombo = (trick) => {
    if (userCombo) {
      const newTrickArray = [...userCombo.tricks, trick];

      const { minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks } = computeStats(newTrickArray);

      setUserCombo({
        ...userCombo,
        tricks: newTrickArray,
        minDiff: minDiff,
        maxDiff: maxDiff,
        avgDiff: avgDiff,
        totalDiff: totalDiff,
        numberOfTricks: numberOfTricks,
        endPos: newTrickArray[newTrickArray.length-1].endPos,
      });
    } else {
      const { minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks } = computeStats([trick]);

      setUserCombo({
        tricks: [trick],
        minDiff: minDiff,
        maxDiff: maxDiff,
        avgDiff: avgDiff,
        totalDiff: totalDiff,
        numberOfTricks: numberOfTricks,
        startPos: trick.startPos,
        endPos: trick.endPos,
      });
    }

  }

  const onClickTrick = (trick) => {
    updateScrollPosition();
    if (location.state) {
      if (location.state.addTrickToCombo) {
        addTrickToUserCombo(trick);
        if (location.state.preCombo){
          navigate('/postcombo', { state: { preCombo: location.state.preCombo }});
        } else {
          navigate('/postcombo');
        }
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
            {trick.boostSkill && (
              <>
              <br/>
              <IoRocketSharp />
              </>)}
          </button>
      </div>);
  }

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) { return null } else console.log(tricks);

  const fuse = new Fuse(tricks, options)
  const searchResults = searchPattern ? fuse.search(searchPattern).map(i => i.item) : tricks;

  return (
    <div className="row">
       <input
        className="form-control"
        type="search"
        value={searchPattern}
        placeholder="Search"
        onChange={(e) => setSearchPattern(e.target.value)}
      />
      {searchResults.map(trick => {
        let isFirst = (sortingSchemes[sortOpt].attributeFunc(trick) !== current);
        current = sortingSchemes[sortOpt].attributeFunc(trick);

        if (isFirst && sortingSchemes[sortOpt].showCategory && !searchPattern) {
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
