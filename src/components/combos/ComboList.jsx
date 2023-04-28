import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { useLiveQuery } from "dexie-react-hooks";
import { comboSortingSchemes } from '../../services/sortingSchemes';
import { IoRocketSharp } from 'react-icons/io5';
import Fuse from 'fuse.js';
import SearchBar from '../misc/SearchBar';

import Database from "../../services/db";
import {Col} from "react-bootstrap";
import ClickableSkillItem from "../misc/ClickableSkillItem";
import {useNavigate} from "react-router";
const db = new Database();

const ComboList = ({ scrollPosition, setScrollPosition }) => {
  const [sortOpt, setSortOpt] = useState(0);
  const [searchPattern, setSearchPattern] = useState("");

  const navigate = useNavigate();

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
      <Col key={combo.id} xs={4} lg={3} xl={2} className="p-md-2 p-1">
        <ClickableSkillItem
          name={combo.name}
          strickFreq={combo.stickFrequency}
          isBoosted={combo.boostSkill}
          onClick={() => {
            updateScrollPosition();
            navigate(`/combos/${combo.id}`);
          }}
        />
      </Col>
    )
  }

  let current;

  return (
    <div>
      <div className="px-md-2 px-1">
        <SearchBar
          sortingSchema={comboSortingSchemes}
          dropdownHeader="Sort combos"
          searchPattern={searchPattern}
          onFilter={value => setSearchPattern(value)}
          onSort={schemeId => setSortOpt(schemeId)} />
      </div>
      <div className="row m-0 p-0">
        {searchResults.map(combo => {
          const isFirst = (comboSortingSchemes[sortOpt].attributeFunc(combo) !== current);
          current = comboSortingSchemes[sortOpt].attributeFunc(combo);
          const catName = comboSortingSchemes[sortOpt].catName;
          const attributeLast = comboSortingSchemes[sortOpt].attributeLast

          if (isFirst && comboSortingSchemes[sortOpt].showCategory && !searchPattern) {
            return [
              <div className="w-100 mt-4" key={"header" + combo.id.toString()}>
                <h4 className="fw-bold">{!attributeLast && current} {catName} {attributeLast && current}</h4>
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
    </div>
  );
}
 
export default ComboList;
