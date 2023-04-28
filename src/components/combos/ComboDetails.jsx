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
import VideoEmbed from "../misc/video/VideoEmbed";
import ClickableSkillItem from "../misc/ClickableSkillItem";
const db = new Database();

const ComboDetails = ({ setUserCombo, comboToShow, addTrickToCombo }) => {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const navigate = useNavigate();
  const path = useLocation().pathname.toString().toLowerCase();
  const params = useParams();

  const inGenerator = path === "/generator"
  const inPostCombo = path === "/postcombo"

  /**
   * Depending on the page that the details are shown own, the database is queried for either the combo itself or the
   * trick details. In either case a Promise containing an array of the tricks of the combo is returned.
   */
  const queryDatabaseForCombos = () => {
    if (inGenerator || inPostCombo) {
      // Convert tricks back to just numbers to then query them through the hook.
      comboToShow.tricks = comboToShow.tricks.map(trick => trick.id)
      return db.fillComboWithTricks(comboToShow);
    } else {
      // Combos query with react hooks -- means it refreshes automatically.
      return db.getCombo(params.id);
    }
  };

  const combo = useLiveQuery(() => queryDatabaseForCombos(), [comboToShow]);

  if (!combo) {
    return null
  }

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    combo.stickFrequency = newFreq;
    db.saveCombo(combo)
      .then(res => {
        console.log("Changed stickFrequency.");
      })
      .catch(e => {
        console.warn(e);
      });
  }

  const deleteCombo = () => {
    db.deleteCombo(combo.id)
      .then(() => {
        console.log("Combo deleted.");
      })
      .catch(e => {
        console.warn(e);
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
      <div className={!inPostCombo ? "col-12 mb-1" : "col-md-11 col-10 mb-1"} key={"trick" + trick.id}>
        <ClickableSkillItem
          name={trick.alias || trick.technicalName}
          stickFreq={trick.stickFrequency}
          isBoosted={trick.boostSkill}
          onClick={() => navigate(`/tricks/${trick.id}`)}
          compact={true}
        />
      </div>
      {inPostCombo &&
        <div className="col-1 p-2" align="center">
          <button className="btn btn-link" onClick={() => removeTrickFromCombo(index)}>
            <BsTrashFill style={{fill: '#dc3545'}}/>
          </button>
        </div>
      }
      </>
    );
  }

  const toggleBoostSkill = () => {
    combo.boostSkill ? combo.boostSkill = false : combo.boostSkill = true;
    db.saveCombo(combo).then(res => {
      console.log("Changed boost.");
    }).catch(e => {
      console.warn(e);
    });
  }

  return (
    <div>
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

          <div className="row mt-3">
            {combo.tricks.map((trick, index) => {
              return(index === 0 || (index > 0 && (arePositionsSimilar(trick.startPos, combo.tricks[index-1].endPos) || trick.startPos === combo.tricks[index-1].endPos)) ? 
                  getTrickDiv(trick,index)
                
                :
              index > 0 && (!arePositionsSimilar(trick.startPos, combo.tricks[index-1].endPos) || trick.startPos !== combo.tricks[index-1].endPos) ?
                <>
                <div className={!inPostCombo ? "col-12" : "col-md-11 col-10"} key={index} align="center">
                  <div className="container-fluid">
                    <p className="transition transition-text">{combo.tricks[index-1].endPos}</p>
                  </div>
                  <IconContext.Provider value={{ color: "grey" }}>
                    <div className="container-fluid">
                      <BsArrowDown className="transition" size={10}/>
                    </div>
                  </IconContext.Provider>
                  <div className="container-fluid">
                    <p className="transition transition-text">{trick.startPos}</p>
                  </div>
                </div>
                {getTrickDiv(trick,index)}
                </>
                : null);
            })
            }
          </div>

          {addTrickToCombo &&
            <div className="mt-2">
              <AddButton call={addTrickToCombo} />
            </div>
          }

          <div className="mt-3">
            <h4>Combo stats:</h4>
            <p>Number of tricks: {combo.numberOfTricks}</p>
            <p>Mininum difficulty level: {combo.minDiff}</p>
            <p>Maximum difficulty level: {combo.maxDiff}</p>
            <p>Average difficulty level: {combo.avgDiff}</p>
            <p>Total difficulty level: {combo.totalDiff}</p>
          </div>

          {combo.yearEstablished && combo.establishedBy &&
            <div>
              <h5>Established by: </h5>
              <div className="callout">{combo.establishedBy} in {combo.yearEstablished}</div>
            </div>
          }

          {combo.linkToVideo &&
            <div className="container-fluid mx-0 my-2 p-0" align="center">
              <VideoEmbed link={combo.linkToVideo} timeStart={combo.videoStartTime} timeEnd={combo.videoEndTime}/>
            </div>
          }

          {combo.comments &&
            <div>
              <h5>Comments: </h5>
              <div className="callout">{combo.comments}</div>
            </div>
          }

          {!inGenerator && !inPostCombo && (
            <div className="row">
                <h4>Set your success frequency:</h4>
                <div onChange={selectFreq}>
                  <FreqList stickable={combo}/>
                </div>
            </div>
          )}
          {showDeleteWarning && <DeleteWarning showDeleteWarning={showDeleteWarning} setShowDeleteWarning={setShowDeleteWarning} itemName={combo.name} call={deleteCombo}/>}

          {!inGenerator && !inPostCombo && (
            <div className="boostSkill row justify-content-center">
              <button className={combo.boostSkill ? "col-8 col-lg-3 col-xl-2 btn btn-warning" : "col-8 col-lg-3 col-xl-2 btn btn-primary" } onClick={toggleBoostSkill}>{combo.boostSkill ? "Unboost this combo" : (<><IoRocketSharp/> Boost this combo</>)}</button>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
