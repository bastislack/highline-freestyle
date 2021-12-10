import { Link } from 'react-router-dom'
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../../services/db";
const db = new Database();

const ComboList = ({ sortingSchemes, sortOpt }) => {

  // combos query with react hooks -- means it refreshes automaticly
  const combos = useLiveQuery(() => db.getAllCombos().then(c => c.sort(sortingSchemes[sortOpt].sortFunc)), [sortOpt]);
  if (!combos || combos.length == 0) {
    return <p>You have no saved combos. For now it is only possible to create a combo using the combo generator, we are working on supporting custom combos.</p>;
  }
  console.log(combos)

  function getComboDiv(combo) {
    return (
      <div key={combo.id} className="combo-container col-4 col-lg-3 col-xl-2">
        <Link className="link-to-combo " to={`/combos/${combo.id}`} key={"combo" + combo.id} >
          <button className=" btn btn-outline-success combo-preview skillFreq" freq={combo.stickFrequency}>
            <h3>{combo.name}</h3>
          </button>
        </Link>
      </div>)
  }

  let current;

  return (
    <div className="justify-content-evenly">
      <div className="row">
        {combos.map(combo => {
          let isFirst = (sortingSchemes[sortOpt].attributeFunc(combo) !== current);
          current = sortingSchemes[sortOpt].attributeFunc(combo);

          if (isFirst && sortingSchemes[sortOpt].showCategory) {
            return [
              <div className="w-100 list-br-heading" key={"header" + combo.id.toString()}>
                <h4>{current} {sortingSchemes[sortOpt].catName}</h4>
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
