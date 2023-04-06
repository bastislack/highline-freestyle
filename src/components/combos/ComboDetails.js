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

  if (combo) {
    console.log("ComboAfterQuery:", combo.tricks);
  } else {
    return null;
  }

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
          <button className="btn preview-item skillFreq" freq={trick.stickFrequency}>
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

  let youtubeId;
  let youtubeOpts;
  var instagramLink
  if (combo && combo.linkToVideo) {
    if (combo.linkToVideo.includes("youtu")) {
      // "https://www.youtube.com/embed/<videoID>"
      if (combo.linkToVideo.includes("youtu.be")) {
        youtubeId = combo.linkToVideo.split("/").pop().split("?")[0];
      } else {
        youtubeId = combo.linkToVideo.split("/").pop().split("?v=").pop();
        if (youtubeId.includes("&")) {
          youtubeId = youtubeId.split("&")[0];
        }
      }
      youtubeOpts = {
        playerVars: {
          autoplay: 0,
          fs: 1,
          rel: 0,
          start: combo.videoStartTime,
          end: combo.videoEndTime
        }
      }
    }
    else if (combo.linkToVideo.includes("instagram")) {
      // "https://www.instagram.com/p/<videoID>/embed
      instagramLink = combo.linkToVideo + "embed";
    }
    else {
      console.log("Could not embed this link:\n" + combo.linkToVideo);
    }
  }

  const setupYoutubePlayer = (e) => {
    e.target.mute();
  }

  const restartVideo = (e) => {
    e.target.seekTo(combo.videoStartTime ?? 0);
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

          {combo.yearEstablished && combo.establishedBy &&
            <div>
              <h5>Established by: </h5>
              <div className="callout">{combo.establishedBy} in {combo.yearEstablished}</div>
            </div>
          }

          {youtubeId &&
            <div className="callout video-callout">
              <YouTube className="video" videoId={youtubeId} opts={youtubeOpts} onReady={setupYoutubePlayer} onEnd={restartVideo}/>
            </div>
          }
          {instagramLink &&
            <div className="callout insta-callout">
              <iframe className="insta-video" src={instagramLink} frameBorder="0" scrolling="no" allowtransparency="true" title="video"></iframe>
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
