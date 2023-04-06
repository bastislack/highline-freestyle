import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { useLiveQuery } from "dexie-react-hooks";
import { comboSortingSchemes } from '../../services/sortingSchemes';
import { IoRocketSharp } from 'react-icons/io5';
import Fuse from 'fuse.js';
import SearchBar from '../misc/SearchBar';

import Database from "../../services/db";
const db = new Database();

const ComboList = ({ scrollPosition, setScrollPosition }) => {
  const [sortOpt, setSortOpt] = useState(0);
  const [searchPattern, setSearchPattern] = useState("");

  useEffect(() => {
    document.getElementById("content").scrollTo({
        top: scrollPosition,
        left: 0,
        behavior: 'instant'
    });
  });

  async function combosFromDBSorted(sortingOption) {
    const allCombos = await db.getAllCombos();
    return allCombos.sort(comboSortingSchemes[sortingOption].sortFunc);
  }

  // combos query with react hooks -- means it refreshes automatically
  const combos = useLiveQuery(() => combosFromDBSorted(sortOpt), [sortOpt]);
  if (!combos || combos.length == 0) {
    return <p>You have no saved combos. For now it is only possible to create a combo using the combo generator, we are working on supporting custom combos.</p>;
  }

  const searchOptions = { keys: ["name", "establishedBy"] };
  const fuse = new Fuse(combos, searchOptions);
  const searchResults = searchPattern ? fuse.search(searchPattern).map(i => i.item) : combos;

  const updateScrollPosition = () => {
    setScrollPosition(document.getElementById("content").scrollTop);
  }

  function getComboDiv(combo) {
    return (
      <div key={combo.id} className="combo-container col-4 col-lg-3 col-xl-2">
        <Link className="link-to-combo " to={`/combos/${combo.id}`} key={"combo" + combo.id} >
          <button className=" btn preview-item skillFreq" freq={combo.stickFrequency} onClick={updateScrollPosition}>
            {combo.name}
            {combo.boostSkill && (
              <>
              <IoRocketSharp />
              </>)}
          </button>
        </Link>
      </div>)
  }

  let current;

  return (
    <div className="row">
      <SearchBar
        sortingSchema={comboSortingSchemes}
        dropdownHeader="Sort combos"
        searchPattern={searchPattern}
        onFilter={value => setSearchPattern(value)}
        onSort={schemeId => setSortOpt(schemeId)} />
      {searchResults.map(combo => {
        const isFirst = (comboSortingSchemes[sortOpt].attributeFunc(combo) !== current);
        current = comboSortingSchemes[sortOpt].attributeFunc(combo);
        const catName = comboSortingSchemes[sortOpt].catName;
        const attributeLast = comboSortingSchemes[sortOpt].attributeLast

        if (isFirst && comboSortingSchemes[sortOpt].showCategory && !searchPattern) {
          return [
            <div className="w-100 list-br-heading" key={"header" + combo.id.toString()}>
              <h4>{!attributeLast && current} {catName} {attributeLast && current}</h4>
            </div>,
            getComboDiv(combo)
          ];
        } else {
          return (
            getComboDiv(combo)
          );
        }
      })}
    </div>
  );
}
 
export default ComboList;
