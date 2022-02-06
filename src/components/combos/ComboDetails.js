import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import EditButton from '../buttons/EditButton';
import AddButton from '../buttons/AddButton';
import DeleteButton from '../buttons/DeleteButton';
import FreqList from '../misc/FreqList';
import arePositionsSimilar from '../../logic/combos/similarPositions';
import { BsArrowDown, BsTrashFill } from 'react-icons/bs';
import { IoRocketSharp } from 'react-icons/io5';
import { IconContext } from 'react-icons';
import DeleteWarning from '../pop-ups/DeleteWarning';
import computeStats from '../../logic/combos/computeStats';

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

  const removeTrickFromCombo = (index) => {
    combo.tricks.splice(index,1);
    if (combo.tricks.length > 0) {
      const { minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks } = computeStats(combo.tricks);
      setUserCombo({
        ...comboToShow,
        tricks: combo.tricks,
        minDiff: minDiff,
        maxDiff: maxDiff,
        avgDiff: avgDiff,
        totalDiff: totalDiff,
        numberOfTricks: numberOfTricks,
      });
    } else {
      setUserCombo(null);
    }
  }

  const getTrickDiv = (trick, index) => {
    return(
      <>
      <div className={!inPostCombo ? "col-12" : "col-9"} key={"trick" + trick.id}>
        <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
          <button className="btn trick-preview skillFreq" freq={trick.stickFrequency}>
            <h2>{trick.alias || trick.technicalName}</h2>
          </button>
        </Link>
      </div>
      {inPostCombo &&
        <div className="col-2">
          <button className="btn btn-danger" onClick={() => removeTrickFromCombo(index)}>
            <BsTrashFill/>
          </button>
        </div>
      }
      </>
    );
  }

  const toggleBoostSkill = () => {
    combo.boostSkill ? combo.boostSkill = false : combo.boostSkill = true;
    db.saveCombo(combo).then(res => {
      console.log("changed boost");
    }).catch(e => {
      console.log(e);
    });
  }

  return (
    <div className="container">
      {combo && (
        <article>
          <div className="row">
            {!inPostCombo &&
              <div className="col-8">
                <h2>{combo.name}</h2>
              </div>
            }
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
                  getTrickDiv(trick,index)
                
                :
              index > 0 && (!arePositionsSimilar(trick.startPos, combo.tricks[index-1].endPos) || trick.startPos !== combo.tricks[index-1].endPos) ?
                <>
                <div className={!inPostCombo ? "col-12" : "col-9"} key={index}>
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
                {getTrickDiv(trick,index)}
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
                <h4>Set your success frequency:</h4>
                <div onChange={selectFreq}>
                  <FreqList stickable={combo}/>
                </div>
            </div>
          )}
          {showDeleteWarning && <DeleteWarning showDeleteWarning={showDeleteWarning} setShowDeleteWarning={setShowDeleteWarning} itemName={combo.name} call={deleteCombo}/>}

          <div className="boostSkill row justify-content-center">
            <button className={combo.boostSkill ? "col-8 col-lg-3 col-xl-2 btn btn-warning" : "col-8 col-lg-3 col-xl-2 btn btn-primary" } onClick={toggleBoostSkill}>{combo.boostSkill ? "Unboost this combo" : (<><IoRocketSharp/> Boost this combo</>)}</button>
          </div>
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
