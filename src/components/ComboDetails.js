import { useParams, useHistory } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const ComboDetails = ({stickFrequencies}) => {
  const history = useHistory();
  const { id } = useParams();

  // combos query with react hooks -- means it refreshes automaticly
  const combo = useLiveQuery(() => db.getCombo(id), []);
  if (!combo) {return null} else console.log(combo);

  const freqList = stickFrequencies.map((item, i) => {
    return (
      <label className="skillFreq" freq={i} key={i}>
        <input type="radio" value={i} name="stickFrequency" checked={(combo.stickFrequency === i)} readOnly={true} /> {item}
      </label>
    )
  });

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    combo.stickFrequency = newFreq;
    db.saveCombo(combo)
      .then(res => {
        console.log("changed stickFrequency");
      })
      .catch(e => {
        console.log(e);
      });
  }

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
          <div className="skillFreq">Set your success frequency:
            <div onChange={selectFreq}>
              {freqList}
            </div>
          </div>
          <button onClick={deleteCombo} className="btn btn-primary">Delete Combo</button>
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
