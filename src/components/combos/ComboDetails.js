import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import EditButton from '../buttons/EditButton';
import AddButton from '../buttons/AddButton';
import DeleteButton from '../buttons/DeleteButton';
import { stickFrequencies } from '../../services/enums';
import arePositionsSimilar from '../../logic/combos/similarPositions';
import { BsArrowDown } from 'react-icons/bs';
import { IconContext } from 'react-icons';
import DeleteWarning from '../pop-ups/DeleteWarning';

import Database from "../../services/db";
const db = new Database();

const ComboDetails = ({ setUserCombo, comboToShow, addTrickToCombo }) => {

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

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

  const combo = useLiveQuery(() => queryFunc(), [comboToShow]);

  if (!combo) { return null; } else { console.log("ComboAfterQuery:",combo.tricks); }

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

  const editCombo = () => {
    setUserCombo(null);
    navigate("/postcombo", { state: { preCombo: combo }});
  }

  return (
    <div className="container">
      {combo && (
        <article>
          <div className="row">
            <div className="col-8">
              <h2>{combo.name}</h2>
            </div>
            {!inGenerator && !inPostCombo &&
              <div className="col-4 justify-content-end">
                <EditButton call={editCombo} />
                <DeleteButton setShowDeleteWarning={setShowDeleteWarning}/>
              </div>
            }
          </div>

          <div className="row">
            {combo.tricks.map((trick, index) => {
              return(index === 0 || (index > 0 && (arePositionsSimilar(trick.startPos, combo.tricks[index-1].endPos) || trick.startPos === combo.tricks[index-1].endPos)) ? 
                <div className="col-12" key={index}>
                  <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
                    <button className="btn trick-preview skillFreq" freq={trick.stickFrequency}>
                      <h2>{trick.alias || trick.technicalName}</h2>
                    </button>
                  </Link>
                </div>
                :
              index > 0 && (!arePositionsSimilar(trick.startPos, combo.tricks[index-1].endPos) || trick.startPos !== combo.tricks[index-1].endPos) ?
                <>
                <div className="col-12" key={index}>
                  <div className="row">
                    <p className="transition transition-text">{combo.tricks[index-1].endPos}</p>
                  </div>
                  <IconContext.Provider value={{ color: "grey" }}>
                    <div className="row">
                      <BsArrowDown className="transition" size={10}/>
                    </div>
                  </IconContext.Provider>
                  <div className="row">
                    <p className="transition transition-text">{trick.startPos}</p>
                  </div>
                </div>
                <div className="col-12">
                  <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
                    <button className="btn trick-preview skillFreq" freq={trick.stickFrequency}>
                      <h2>{trick.alias || trick.technicalName}</h2>
                    </button>
                  </Link>
                </div>
                </>
                : null);
            })
            }
          </div>

          {addTrickToCombo && <AddButton call={addTrickToCombo} />}

          <div className="row">
            <h4>Combo stats:</h4>
            <p>Number of tricks: {combo.numberOfTricks}</p>
            <p>Mininum difficulty level: {combo.minDiff}</p>
            <p>Maximum difficulty level: {combo.maxDiff}</p>
            <p>Average difficulty level: {combo.avgDiff}</p>
            <p>Total difficulty level: {combo.totalDiff}</p>
          </div>

          {!inGenerator && !inPostCombo && (
            <div className="row">
              <div className="skillFreq">
                <h4>Set your success frequency:</h4>
                <div onChange={selectFreq}>
                  {freqList}
                </div>
              </div>
            </div>
          )}
          {showDeleteWarning && <DeleteWarning showDeleteWarning={showDeleteWarning} setShowDeleteWarning={setShowDeleteWarning} itemName={combo.name} call={deleteCombo}/>}
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
