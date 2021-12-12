import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';

import Database from "../../services/db";
const db = new Database();

const ComboDetails = ({ stickFrequencies, randomCombo }) => {
  const navigate = useNavigate();
  const path = useLocation().pathname.toString().toLowerCase();

  let combo;
  let params;
  const inGenerator = path === "/generator" ? true : false;

  if (inGenerator) {
    combo = randomCombo;
  } else {
    params = useParams();
    // combos query with react hooks -- means it refreshes automaticly
    combo = useLiveQuery(() => db.getCombo(params.id), []);
  }

  if (!combo) { return null; } else { console.log(combo); }

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
    db.deleteCombo(params.id)
      .then(() => {
        console.log("combo deleted");
      })
      .catch(e => {
        console.log(e);
      });

    navigate('/combos');
  };

  const editCombo = () => navigate("/postcombo", { preCombo: combo });

  return (
    <div className="container">
      {combo && (
        <article>
          <div className="row">
            <div className="col-8">
              <h2>{combo.name}</h2>
            </div>
            {!inGenerator &&
              <div className="col-4 justify-content-end">
                <EditButton call={editCombo} />
                <DeleteButton call={deleteCombo} />
              </div>
            }
          </div>

          <div className="row">
            {combo.tricks.map(trick => (
              <div className="col-12">
                <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
                  <button className="btn trick-preview skillFreq" freq={trick.stickFrequency}>
                    <h2>{trick.alias || trick.technicalName}</h2>
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div className="row">
            <h4>Combo stats:</h4>
            <p>Number of tricks: {combo.numberOfTricks}</p>
            <p>Mininum difficulty level: {combo.minDiff}</p>
            <p>Maximum difficulty level: {combo.maxDiff}</p>
            <p>Average difficulty level: {combo.avgDiff}</p>
            <p>Total difficulty level: {combo.totalDiff}</p>
          </div>

          {!inGenerator && (
            <div className="row">
              <div className="skillFreq">
                <h4>Set your success frequency:</h4>
                <div onChange={selectFreq}>
                  {freqList}
                </div>
              </div>
            </div>
          )}
          
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
