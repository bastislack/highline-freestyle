import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import { stickFrequencies } from '../../services/enums';

import Database from "../../services/db";
const db = new Database();

const ComboDetails = ({ comboToShow, addTrickToCombo }) => {
  const navigate = useNavigate();
  const path = useLocation().pathname.toString().toLowerCase();
  const params = useParams();

  const inGenerator = path === "/generator" ? true : false;
  const inPostCombo = path === "/postcombo" ? true : false;


  const queryFunc = () => {
    if (inGenerator || inPostCombo) {
      // convert tricks back to just numbers to then query them through the hook
      comboToShow.tricks = comboToShow.tricks.map(trick => trick.id)
      return db.fillComboWithTricks(comboToShow);
    } else {
      // combos query with react hooks -- means it refreshes automaticly
      return db.getCombo(params.id);
    }
  };

  const combo = useLiveQuery(() => queryFunc(), []);

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
    db.deleteCombo(combo.id)
      .then(() => {
        console.log("combo deleted");
      })
      .catch(e => {
        console.log(e);
      });

    navigate('/combos');
  };

  const editCombo = () => navigate("/postcombo", { state: { preCombo: combo }});

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

          {addTrickToCombo && <button onClick={addTrickToCombo}>+</button>}

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
