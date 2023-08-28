import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from "dexie-react-hooks";
import { trickSortingSchemes as sortingSchemes } from '../../services/sortingSchemes';
import computeStats from '../../logic/combos/computeStats';
import { IoRocketSharp } from 'react-icons/io5';
import Fuse from 'fuse.js';
import { trickSortingSchemes } from '../../services/sortingSchemes';
import SearchBar from "../misc/SearchBar"

import Database from "../../services/db";
import {Col} from "react-bootstrap";
import ClickableSkillItem from "../misc/ClickableSkillItem";
const db = new Database();

const TrickList = ({ scrollPosition, setScrollPosition, userCombo, setUserCombo }) => {
  const [sortOpt, setSortOpt] = useState(0);
  const [searchPattern, setSearchPattern] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  let addTrickToCombo = false;

  if (location.state && location.state.addTrickToCombo) {
    addTrickToCombo = true;
  }

  let current;
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
    if (addTrickToCombo) {
      addTrickToUserCombo(trick);
      if (location.state.preCombo){
        navigate('/postcombo', { state: { preCombo: location.state.preCombo }});
      } else {
        navigate('/postcombo');
      }
    } else {
      navigate(`/tricks/${trick.id}`);
    }
  }

  function getTrickDiv(trick) {
    return (
      <Col key={trick.id} xs={4} lg={3} xl={2} className="p-lg-2 p-1">
        <ClickableSkillItem
          name={trick.alias || trick.technicalName}
          stickFreq={trick.stickFrequency}
          isBoosted={trick.boostSkill}
          onClick={() => onClickTrick(trick)}
        />
      </Col>
    )
  }

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(() => db.getAllTricks().then(t => t.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!tricks) {
    return null;
  }

  const fuse = new Fuse(tricks, options)
  const searchResults = searchPattern ? fuse.search(searchPattern).map(i => i.item) : tricks;

  return (
    <div>
      <div className="px-lg-2 px-1">
        {addTrickToCombo && <h2 style={{'fontWeight': 'bold'}}>Add trick to combo</h2>}
        <SearchBar
          sortingSchema={trickSortingSchemes}
          dropdownHeader="Sort tricks"
          searchPattern={searchPattern}
          onFilter={value => setSearchPattern(value)}
          onSort={schemeId => setSortOpt(schemeId)} />
      </div>
      <div className="row m-0 p-0">
        {searchResults.map(trick => {
          let isFirst = (sortingSchemes[sortOpt].attributeFunc(trick) !== current);
          current = sortingSchemes[sortOpt].attributeFunc(trick);

          if (isFirst && sortingSchemes[sortOpt].showCategory && !searchPattern) {
            return [
              <div className="w-100 mt-4 mx-0 px-lg-2 px-1" key={"header" + trick.id.toString()}>
                <h4 className="fw-bold">{sortingSchemes[sortOpt].catName} {(current === 999) ? '"to be detemined"' : current}</h4>
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
