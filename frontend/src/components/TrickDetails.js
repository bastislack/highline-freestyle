import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TricksDataService from "../services/tricks.js"

const TrickDetails = () => {
  const { id } = useParams();

  const [trick, setTrick] = useState(null);
  const [stickFreq, setStickFreq] = useState("");

  useEffect(() => {
    retrieveTrick(id);
  }, []);

  const retrieveTrick = (id) => {
    TricksDataService.get(id)
      .then(res => {
        console.log(res.data);
        setTrick(res.data.trick);
      })
      .catch(e => {
        console.log(e);
      });
  };

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
    setStickFreq(e.target.value);
    trick.stickFrequency = stickFreq;
    TricksDataService.update(id, trick)
      .then(res => {
        console.log(res.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  var embeddingLink
  if (trick != null) {
    if (trick.linkToVideo.includes("youtu")) {
      // "http://www.youtube.com/embed/" + <videoID>
      embeddingLink = "http://www.youtube.com/embed/" + trick.linkToVideo.split("/").at(-1).split("?v=").at(-1).replace("?t=","?start=");
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

          {embeddingLink &&
            <div className="callout">
              <iframe id="player" type="text/html" width="640" height="360" title="video"
                src={embeddingLink}
                frameborder="0"></iframe>
            </div>
          }

          <div className="skillFreq">Set your success frequency:
            <select value={trick.stickFrequency} onChange={(e) => selectFreq(e)}>
              {freqList}
            </select>
          </div>
        </article>
      )}
    </div>
  );
}

export default TrickDetails;
