import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useLiveQuery} from "dexie-react-hooks";
import {trickSortingSchemes as sortingSchemes} from "../../services/sortingSchemes";
import computeStats from "../../logic/combos/computeStats";
import {IoRocketSharp} from "react-icons/io5";
import Fuse from "fuse.js";

import Database from "../../services/database/mainDatabase";
import {RootContextData} from "../../routes/root";

interface TrickListProps {
  rootContext: RootContextData;
}

const TrickList = (props: TrickListProps) => {
  const {trickListScrollPosition, setTrickListScrollPosition, userCombo, setUserCombo, sortingOption} =
    props.rootContext;
  const location = useLocation();
  const navigate = useNavigate();

  let addTrickToCombo = false;

  if (location.state) {
    if (location.state.addTrickToCombo) {
      addTrickToCombo = true;
    }
  }

  let current;
  const [searchPattern, setSearchPattern] = useState("");
  const options = {
    keys: ["alias", "technicalName"],
  };
  useEffect(() => {
    document.getElementById("content")!.scrollTo({
      top: trickListScrollPosition,
      left: 0,
      behavior: "instant" as any, // TODO: instant not found
    });
  });
  const updateScrollPosition = () => {
    setTrickListScrollPosition(document.getElementById("content")?.scrollTop ?? 0);
  };

  const addTrickToUserCombo = (trick) => {
    if (userCombo) {
      const newTrickArray = [...userCombo.tricks, trick];

      const {minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks} = computeStats(newTrickArray);

      setUserCombo({
        ...userCombo,
        tricks: newTrickArray,
        minDiff: minDiff,
        maxDiff: maxDiff,
        avgDiff: avgDiff,
        totalDiff: totalDiff,
        numberOfTricks: numberOfTricks,
        endPos: newTrickArray[newTrickArray.length - 1].endPos,
      });
    } else {
      const {minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks} = computeStats([trick]);

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
  };

  const onClickTrick = (trick) => {
    updateScrollPosition();
    if (addTrickToCombo) {
      addTrickToUserCombo(trick);
      if (location.state.preCombo) {
        navigate("/postcombo", {state: {preCombo: location.state.preCombo}});
      } else {
        navigate("/postcombo");
      }
    } else {
      navigate(`/tricks/${trick.id}`);
    }
  };

  function getTrickDiv(trick) {
    return (
      <div key={trick.id} className="trick-container col-4 col-lg-3 col-xl-2">
        <button
          className=" btn trick-preview skillFreq"
          freq={trick.stickFrequency}
          onClick={() => onClickTrick(trick)}
        >
          {trick.alias || trick.technicalName}
          {trick.boostSkill && (
            <>
              <br />
              <IoRocketSharp />
            </>
          )}
        </button>
      </div>
    );
  }

  // tricks query with react hooks -- means it refreshes automaticly
  // and sorts it according to the sortOpt
  const tricks = useLiveQuery(
    () => Database.instance.tricks.getAll().then((t) => t.sort(sortingSchemes[sortingOption].sortFunc)),
    [sortingOption]
  );
  if (!tricks) {
    return null;
  } else console.log(tricks);

  const fuse = new Fuse(tricks, options);
  const searchResults = searchPattern ? fuse.search(searchPattern).map((i) => i.item) : tricks;

  return (
    <div className="row">
      {addTrickToCombo && <h2 style={{fontWeight: "bold"}}>Add trick to combo</h2>}
      <input
        className="form-control"
        type="search"
        value={searchPattern}
        placeholder="Search"
        onChange={(e) => setSearchPattern(e.target.value)}
      />
      {searchResults.map((trick) => {
        let isFirst = sortingSchemes[sortingOption].attributeFunc(trick) !== current;
        current = sortingSchemes[sortingOption].attributeFunc(trick);

        if (isFirst && sortingSchemes[sortingOption].showCategory && !searchPattern) {
          return [
            <div className="w-100 list-br-heading" key={"header" + trick.id.toString()}>
              <h4>
                {sortingSchemes[sortingOption].catName} {current}
              </h4>
            </div>,
            getTrickDiv(trick),
          ];
        } else {
          return getTrickDiv(trick);
        }
      })}
    </div>
  );
};
export default TrickList;
