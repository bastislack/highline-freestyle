import { useParams, useHistory } from "react-router-dom";
import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const ComboDetails = () => {
  const history = useHistory();
  const { id } = useParams();

  // combos query with react hooks -- means it refreshes automaticly
  const combo = useLiveQuery(() => db.getCombo(id), []);
  if (!combo) {return null} else console.log(combo);

  const deleteCombo = () => {
    db.deleteCombo(id)
      .then(() => {
        console.log("combo deleted");
      })
      .catch(e => {
        console.log(e);
      });

    history.push('/combos');
  };

  return (
    <div className="combo-details">
      {combo && (
        <article>
          <h2>{combo.name}</h2>
          {combo.tricks.map(trick => (
            <div className="row callout" key={trick.id}>
              <p>{trick.alias || trick.technicalName}</p>
            </div>
          ))}
          <button onClick={deleteCombo} className="btn btn-primary">Delete Combo</button>
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
