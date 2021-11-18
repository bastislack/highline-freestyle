import { useParams, useLocation, useHistory, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../../services/db";
const db = new Database();

const ComboDetails = ({stickFrequencies, randomCombo}) => {
  const history = useHistory();
  const path = useLocation().pathname.toString().toLowerCase();

  let combo;

  if (path === "/generator") {
    combo = randomCombo;
  } else {
    const { id } = useParams();
    // combos query with react hooks -- means it refreshes automaticly
    combo = useLiveQuery(() => db.getCombo(id), []);
  }

  if (!combo) {return null;} else {console.log(combo);}

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
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-sm-5">
              {combo.tricks.map(trick => (
                <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
                  <button className="col-10 btn btn-outline-success  skillFreq" freq={trick.stickFrequency}>
                    <h2>{trick.alias || trick.technicalName}</h2>
                  </button>
                </Link>
              ))}
              </div>
              <div className="col-sm-5">
                <h4>Combo stats:</h4> 
                <p>Number of tricks: {combo.numberOfTricks}</p>
                <p>Mininum difficulty level: {combo.minDiff}</p>
                <p>Maximum difficulty level: {combo.maxDiff}</p>
                <p>Average difficulty level: {combo.avgDiff}</p>
                <p>Total difficulty level: {combo.totalDiff}</p>
              </div>
            </div>
          </div>
          {path !== "/generator" && (
            <>
              <div className="skillFreq">Set your success frequency:
                <div onChange={selectFreq}>
                  {freqList}
                </div>
              </div>
              <button onClick={deleteCombo} className="btn btn-primary">Delete Combo</button>
            </>
          )}
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
