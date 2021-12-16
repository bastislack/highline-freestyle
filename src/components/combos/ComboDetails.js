import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';

import Database from "../../services/db";
const db = new Database();

const ComboDetails = ({stickFrequencies, randomCombo}) => {
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
    db.deleteCombo(combo.id)
      .then(() => {
        console.log("combo deleted");
      })
      .catch(e => {
        console.log(e);
      });

    navigate('/combos');
  };

  const editCombo = () => navigate("/postcombo", {preCombo:combo});

  return (
    <div className="combo-details">
      {combo && (
        <article>
          <div className="row align-items-center justify-content-between">
            <h2 className="col-6" align="left">{combo.name}</h2>

            {!inGenerator &&
              <>
              <div className="col-3" align="center">
                <EditButton call={editCombo}/>
              </div>

              <div className="col-3" align="right">
                <DeleteButton call={deleteCombo}/>
              </div>
              </>
            }
          </div>
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
          {!inGenerator && (
            <>
              <div className="skillFreq">Set your success frequency:
                <div onChange={selectFreq}>
                  {freqList}
                </div>
              </div>
            </>
          )}
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
