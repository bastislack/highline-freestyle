import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import Database from "../services/db";
const db = new Database();

const TrickDetails = () => {
  const { id } = useParams();

  // stickFrequency as a number from 0-5
  const [stickFreq, setStickFreq] = useState(0);

  const trick = useLiveQuery(() => db.getTrick(id), []);
  if (!trick) return null

  const freqs = [
    { name: "Impossible", color: "white" },
    { name: "Only once", color: "red" },
    { name: "Rarely", color: "LightPink" },
    { name: "Sometimes", color: "LightYellow" },
    { name: "Generally", color: "LightGreen" },
    { name: "Always", color: "LightSkyBlue" }
  ];

  const freqList = freqs.map((item, i) => {
    return (
      <option value={i} background={item.color}>{item.name}</option>
    )
  });

  const selectFreq = (e) => {
    const newFreq = Number(e.target.value);
    setStickFreq(newFreq);
    trick.stickFrequency = newFreq;
    db.saveTrick(trick)
      .then(res => {
        console.log("changed stickFrequency");
      })
      .catch(e => {
        console.log(e);
      });
    console.log(stickFreq, newFreq);
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
          <h3>Start from: </h3>
          <div className="callout">{trick.startPos}</div>
          <h3>End in: </h3>
          <div className="callout">{trick.endPos}</div>
          <h3>Description: </h3>
          <div className="callout">{trick.description}</div>

          {youtubeLink &&
            <div className="callout">
              <iframe id="youtubePlayer" type="text/html" width="640" height="360" title="video"
                src={youtubeLink}
                frameborder="0"></iframe>
            </div>
          }
          {instagramLink &&
            <div className="callout">
              <iframe src={instagramLink} width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
            </div>
          }

          <div className="skillFreq">Set your success frequency:
            <select value={freqs[trick.stickFrequency].name} onChange={(e) => selectFreq(e)}>
              {freqList}
            </select>
          </div>
        </article>
      )}
    </div>
  );
}

export default TrickDetails;
