import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"

const ComboList = () => {

  const [combos, setCombos] = useState([]);

  useEffect(() => {
    retrieveCombos();
  }, [combos]); 

  const retrieveCombos = () => {
    // TODO make this work again
    //CombosDataService.getAll()
    //  .then(res => {
    //    console.log(res.data);
    //    setCombos(res.data.combos);
    //  })
    //  .catch(e => {
    //    console.log(e);
    //  });
  };

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
          <div key={combo._id}>
            { isFirstOfCategory && <div>{combo.numberOfTricks} Trick Combos</div> }
              <Link className="link-to-combo" to={`/combos/${combo._id}`} >
                <button className="btn btn-outline-primary" >{ combo.name }</button>
              </Link>
          </div>
        );
      })}
    </div>
  );
}
 
export default ComboList;
