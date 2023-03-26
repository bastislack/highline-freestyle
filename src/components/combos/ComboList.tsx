import {useEffect} from "react";
import {Link} from "react-router-dom";
import {useLiveQuery} from "dexie-react-hooks";
import {comboSortingSchemes as sortingSchemes} from "../../services/sortingSchemes";
import {IoRocketSharp} from "react-icons/io5";

import Database from "../../services/database/mainDatabase";
import {RootContextData} from "../../App";

interface ComboListProps {
  rootContext: RootContextData;
}

const ComboList = (props: ComboListProps) => {
  const {
    sortingOption,
    comboListScrollPosition: scrollPosition,
    setComboListScrollPosition: setScrollPosition,
  } = props.rootContext;
  useEffect(() => {
    document.getElementById("content")!.scrollTo({
      top: scrollPosition,
      left: 0,
      behavior: "instant",
    });
  });

  // combos query with react hooks -- means it refreshes automaticly
  const combos = useLiveQuery(
    () => Database.instance.combos.getAll().then((c) => c.sort(sortingSchemes[sortingOption].sortFunc)),
    [sortingOption]
  );
  if (!combos || combos.length == 0) {
    return (
      <p>
        You have no saved combos. For now it is only possible to create a combo using the combo generator, we are
        working on supporting custom combos.
      </p>
    );
  }
  console.log(combos);

  const updateScrollPosition = () => {
    setScrollPosition(document.getElementById("content")!.scrollTop);
  };

  function getComboDiv(combo) {
    return (
      <div key={combo.id} className="combo-container col-4 col-lg-3 col-xl-2">
        <Link className="link-to-combo " to={`/combos/${combo.id}`} key={"combo" + combo.id}>
          <button
            className=" btn btn-outline-success combo-preview skillFreq"
            freq={combo.stickFrequency}
            onClick={updateScrollPosition}
          >
            <h3>{combo.name}</h3>
            {combo.boostSkill && (
              <>
                <IoRocketSharp />
              </>
            )}
          </button>
        </Link>
      </div>
    );
  }

  let current;

  return (
    <div className="justify-content-evenly">
      <div className="row">
        {combos.map((combo) => {
          let isFirst = sortingSchemes[sortingOption].attributeFunc(combo) !== current;
          current = sortingSchemes[sortingOption].attributeFunc(combo);

          if (isFirst && sortingSchemes[sortingOption].showCategory) {
            return [
              <div className="w-100 list-br-heading" key={"header" + combo.id.toString()}>
                <h4>
                  {!sortingSchemes[sortingOption].attributeLast && current} {sortingSchemes[sortingOption].catName}{" "}
                  {sortingSchemes[sortingOption].attributeLast && current}
                </h4>
              </div>,
              getComboDiv(combo),
            ];
          } else {
            return getComboDiv(combo);
          }
        })}
      </div>
    </div>
  );
};

export default ComboList;
