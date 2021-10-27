import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const ComboList = () => {

  // combos query with react hooks -- means it refreshes automaticly
  const combos = useLiveQuery(() => db.getAllCombos(), []);
  if (!combos) {return null} else console.log(combos);

  let previousComboLength = 0;

  return (
    <div className="combo-list">
      {combos.map(combo => {
        let isFirstOfCategory = false;

        if (combo.numberOfTricks === previousComboLength) {
          isFirstOfCategory = false;
        } else {
          isFirstOfCategory = true;
        }

        previousComboLength = combo.numberOfTricks

        return (
          <div key={combo.id}>
            { isFirstOfCategory && <div>{combo.numberOfTricks} Trick Combos</div> }
              <Link className="link-to-combo" to={`/combos/${combo.id}`} >
                <button className="btn btn-outline-primary" >{ combo.name }</button>
              </Link>
          </div>
        );
      })}
    </div>
  );
}
 
export default ComboList;
