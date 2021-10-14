import { useParams } from "react-router-dom";
import { useState, useEffect } from "react"
import CombosDataService from "../services/combos.js"

const ComboDetails = () => {
  const { id } = useParams();
  const [combo, setCombo] = useState(null);

  useEffect(() => {
    retrieveCombo(id);
  }, []); 

  const retrieveCombo = (id) => {
    CombosDataService.get(id)
      .then(res => {
        console.log(res.data);
        setCombo(res.data.combo);
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <div className="combo-details">
      {combo && (
        <article>
          <h2>{combo.name}</h2>
          {combo.tricks.map(trick => (
            <div className="row callout" key={trick._id}>
              <p>{trick}</p>
            </div>
          ))}
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
