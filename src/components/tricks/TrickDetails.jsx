import { useState } from 'react';
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import FreqList from '../misc/FreqList';
import { Trans } from '@lingui/macro'
import DeleteWarning from '../pop-ups/DeleteWarning';
import { IoRocketSharp } from 'react-icons/io5';

import Database from "../../services/db";
import VideoEmbed from "../misc/video/VideoEmbed";
import ClickableSkillItem from "../misc/ClickableSkillItem";
const db = new Database();

const TrickDetails = () => {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const { id } = useParams();

  const navigate = useNavigate();

  const trick = useLiveQuery(async () => {
    const dbTrick = await db.getTrick(id);
    const resolvedRecommendations = [];

    if (!dbTrick || !dbTrick.id) return null;

    if (dbTrick.recommendedPrerequisites && dbTrick.recommendedPrerequisites.map) {
      await Promise.all (dbTrick.recommendedPrerequisites.map (async recommendedId => {
        resolvedRecommendations.push(await db.getTrick(recommendedId));
      }));
    }

    dbTrick.recommendedPrerequisites = resolvedRecommendations;
    return dbTrick;
  }, [id]);

  if (!trick) return <>Trick id: {id} not found in database</>;

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    db.changeTrickStickFrequency(trick.id, newFreq).catch(e => {
      console.warn(e);
    });
  }

  const editTrick = () => navigate("/posttrick",{state: {preTrick:trick}});

  const deleteTrick = () => {
    db.deleteTrick(id)
      .catch(e => {
        console.warn(e);
      });

    navigate('/');
  };

  const toggleBoostSkill = () => {
    trick.boostSkill ? trick.boostSkill = false : trick.boostSkill = true;
    db.saveTrick(trick).catch(e => {
      console.warn(e);
    });
  }

  function TipList(props) {
    const listItems = props.tips.map(tip =>
      <li key={tip}>{tip}</li>
    );
    return (<ul className="callout">{listItems}</ul>);
  }

  return (
    <div className="trick-details">
      {trick && (
        <article>
          <div className="row align-items-center justify-content-between">
            <h2 className="col-6" align="left">{trick.alias || trick.technicalName}</h2>

            <div className="col-3" align="center">
              <EditButton call={editTrick}/>
            </div>

            <div className="col-3" align="right">
              <DeleteButton setShowDeleteWarning={setShowDeleteWarning}/>
            </div>
          </div>
          {trick.alias && trick.technicalName &&
            <div>
              <h6>Technical Name: </h6>
              <div className="callout">{trick.technicalName}</div>
            </div>
          }

          {trick.startPos && trick.endPos &&
            <div>
              <div className="callout">from {trick.startPos} to {trick.endPos}</div>
            </div>
          }

          {(trick.difficultyLevel >= 0) &&
            <div>
              <h6><Trans id="trickDetails.level">Level</Trans>: </h6>
              <div className="callout">{(trick.difficultyLevel != 999) ? trick.difficultyLevel : "to be determined"}</div>
            </div>
          }

          {trick.description &&
            <div>
              <h6>Description: </h6>
              <div className="callout">{trick.description}</div>
            </div>
          }

          {trick.tips && trick.tips.length > 0 &&
            <div>
              <h6>Tips: </h6>
              <TipList tips={trick.tips} />
            </div>
          }

          {trick.yearEstablished && trick.establishedBy &&
            <div>
              <h6>Established by: </h6>
              <div className="callout">{trick.establishedBy} in {trick.yearEstablished}</div>
            </div>
          }

          {trick.linkToVideo &&
            <div className="container-fluid mx-0 my-2 p-0" align="center">
              <VideoEmbed link={trick.linkToVideo} timeStart={trick.videoStartTime} timeEnd={trick.videoEndTime}/>
            </div>
          }


          {trick.recommendedPrerequisites.length !== 0 &&
            <div className="row">
              <h6>Recommended Prerequisites:</h6>
              {trick.recommendedPrerequisites.map(recommendedTrick => {
                if(recommendedTrick){
                  return (
                    <div key={recommendedTrick.id} className="trick-container col-12 mb-2">
                      <ClickableSkillItem
                        name={recommendedTrick.alias || recommendedTrick.technicalName}
                        stickFreq={recommendedTrick.stickFrequency}
                        isBoosted={recommendedTrick.boostSkill}
                        onClick={() => {navigate(`/tricks/${recommendedTrick.id}`);}}
                        />
                    </div>
                  );
                }
              })}
            </div>
          }

          <div className="row mt-2">
            <h5>Set your success frequency:</h5>
            <div onChange={selectFreq}>
              <FreqList stickable={trick}/>
            </div>
          </div>

          <div className="boostSkill row justify-content-center">
            <button className={trick.boostSkill ? "col-8 col-lg-3 col-xl-2 btn btn-warning" : "col-8 col-lg-3 col-xl-2 btn btn-primary" } onClick={toggleBoostSkill}>{trick.boostSkill ? "Unboost this trick" : (<><IoRocketSharp/> Boost this trick</>)}</button>
          </div>

          {showDeleteWarning && <DeleteWarning showDeleteWarning={showDeleteWarning} setShowDeleteWarning={setShowDeleteWarning} itemName={trick.alias || trick.technicalName} call={deleteTrick} />}
        </article>
      )}
    </div>
  );
}

export default TrickDetails;
