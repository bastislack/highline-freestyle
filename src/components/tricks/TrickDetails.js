import { useState } from 'react';
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import EditButton from '../buttons/EditButton';
import DeleteButton from '../buttons/DeleteButton';
import { stickFrequencies } from '../../services/enums';
import YouTube from 'react-youtube';
import DeleteWarning from '../pop-ups/DeleteWarning';
import { IoRocketSharp } from 'react-icons/io5';

import Database from "../../services/db";
const db = new Database();

const TrickDetails = () => {

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const { id } = useParams();

  const navigate = useNavigate();

  const trick = useLiveQuery(() => db.getTrick(id), []);
  if (!trick) return null

  console.log(trick);

  const freqList = stickFrequencies.map((item, i) => {
    return (
      <label className="skillFreq form-check" freq={i} key={i}>
        <input className="form-check-input" type="radio" value={i} name="stickFrequency" checked={(trick.stickFrequency === i)} readOnly={true} /> {item}
      </label>
    )
  });

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    trick.stickFrequency = newFreq;
    db.saveTrick(trick).then(res => {
      console.log("changed stickFrequency");
    }).catch(e => {
      console.log(e);
    });
  }

  let youtubeId;
  let youtubeOpts;
  var instagramLink
  if (trick && trick.linkToVideo) {
    if (trick.linkToVideo.includes("youtu")) {
      // "https://www.youtube.com/embed/<videoID>"
      if (trick.linkToVideo.includes("youtu.be")) {
        youtubeId = trick.linkToVideo.split("/").pop().split("?")[0];
      } else {
        youtubeId = trick.linkToVideo.split("/").pop().split("?v=").pop();
        if (youtubeId.includes("&")) {
          youtubeId = youtubeId.split("&")[0];
        }
      }
      youtubeOpts = {
        playerVars: {
          autoplay: 0,
          fs: 1,
          rel: 0,
          start: trick.videoStartTime,
          end: trick.videoEndTime
        }
      }
    }
    else if (trick.linkToVideo.includes("instagram")) {
      // "https://www.instagram.com/p/<videoID>/embed
      instagramLink = trick.linkToVideo + "embed";
    }
    else {
      console.log("Could not embed this link:\n" + trick.linkToVideo);
    }
  }

  const setupYoutubePlayer = (e) => {
    e.target.mute();
  }

  const restartVideo = (e) => {
    e.target.seekTo(trick.videoStartTime ?? 0);
  }

  const editTrick = () => navigate("/posttrick",{state: {preTrick:trick}});

  const deleteTrick = () => {
    db.deleteTrick(id)
      .then(() => {
        console.log("trick deleted");
      })
      .catch(e => {
        console.log(e);
      });

    navigate('/');
  };

  const toggleBoostSkill = () => {
    trick.boostSkill ? trick.boostSkill = false : trick.boostSkill = true;
    db.saveTrick(trick).then(res => {
      console.log("changed boost");
    }).catch(e => {
      console.log(e);
    });
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
              <h3>Technical Name: </h3>
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
              <h3>Level: </h3>
              <div className="callout">{trick.difficultyLevel}</div>
            </div>
          }

          {trick.description &&
            <div>
              <h3>Description: </h3>
              <div className="callout">{trick.description}</div>
            </div>
          }

          {trick.tips &&
            <div>
              <h3>Tips: </h3>
              <div className="callout">{trick.tips}</div>
            </div>
          }

          {trick.yearEstablished && trick.establishedBy &&
            <div>
              <h3>Established by: </h3>
              <div className="callout">{trick.establishedBy} in {trick.yearEstablished}</div>
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

          <div className="skillFreq">Set your success frequency:
            <div onChange={selectFreq}>
              {freqList}
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
