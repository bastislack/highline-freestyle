import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const TrickDetails = () => {
  const { id } = useParams();

  const trick = useLiveQuery(() => db.getTrick(id), []);
  if (!trick) return null

  console.log(trick);

  const freqs = [
    "Impossible",
    "Only once",
    "Rarely",
    "Generally",
    "Always"
  ];

  const freqList = freqs.map((item, i) => {
    return (
      <label className="skillFreq form-check" freq={i} key={i}>
        <input className="form-check-input" type="radio" value={i} name="stickFrequency" checked={(trick.stickFrequency === i)} readOnly={true} /> {item}
      </label>
    )
  });

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    trick.stickFrequency = newFreq;
    db.updateTrickAtributes(Object({"id": trick.id, "stickFrequency": newFreq}))
      .then(res => {
        console.log("changed stickFrequency");
      })
      .catch(e => {
        console.log(e);
      });
  }

  var youtubeLink
  var instagramLink
  if (trick != null) {
    if (trick.linkToVideo.includes("youtu")) {
      // "http://www.youtube.com/embed/<videoID>"
      youtubeLink = "http://www.youtube.com/embed/" + trick.linkToVideo.split("/").at(-1).split("?v=").at(-1).replace("?t=", "?start=");
    }
    else if (trick.linkToVideo.includes("instagram")) {
      // "https://www.instagram.com/p/<videoID>/embed
      instagramLink = trick.linkToVideo + "embed";
    }
    else {
      console.log("Could not embed this link:\n" + trick.linkToVideo);
    }
  }

  return (
    <div className="trick-details">
      {trick && (
        <article>
          <h2>{trick.alias || trick.technicalName}</h2>

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

          {trick.difficultyLevel &&
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

          {youtubeLink &&
            <div className="callout">
              <iframe id="youtubePlayer" type="text/html" width="640" height="360" title="video"
                src={youtubeLink}
                frameBorder="0"></iframe>
            </div>
          }
          {instagramLink &&
            <div className="callout">
              <iframe src={instagramLink} width="400" height="480" frameBorder="0" scrolling="no" allowtransparency="true" title="video"></iframe>
            </div>
          }

          <div className="skillFreq">Set your success frequency:
            <div onChange={selectFreq}>
              {freqList}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

export default TrickDetails;
