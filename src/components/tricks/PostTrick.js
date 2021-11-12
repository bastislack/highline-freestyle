import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import Database from "../../services/db";
const db = new Database();

const PostTrick = ({stickFrequencies, positions}) => {

  const location = useLocation();
  const preTrick = location.preTrick;

  const [alias, setAlias] = useState(() => {
    return preTrick ? preTrick.alias : null;
  });
  const [technicalName, setTechnicalName] = useState(() => {
    return preTrick ? preTrick.technicalName : null;
  });
  const [establishedBy, setEstablishedBy] = useState(() => {
    return preTrick ? preTrick.establishedBy : null;
  });
  const [yearEstablished, setYearEstablished] = useState(() => {
    return preTrick ? preTrick.yearEstablished : null;
  });
  const [linkToVideo, setLinkToVideo] = useState(() => {
    return preTrick ? preTrick.linkToVideo : null;
  });
  const [startPos, setStartPos] = useState(() => {
    return preTrick ? positions.findIndex(item => item === preTrick.startPos) : positions.findIndex(item => item === "HANG");
  });
  const [endPos, setEndPos] = useState(() => {
    return preTrick ? positions.findIndex(item => item === preTrick.endPos): positions.findIndex(item => item === "EXPOSURE");
  });
  const [difficultyLevel, setDifficultyLevel] = useState(() => {
    return preTrick ? preTrick.difficultyLevel : null;
  });
  const [description, setDescription] = useState(() => {
    return preTrick ? preTrick.description : null;
  });
  const [tips, setTips] = useState(() => {
    return preTrick ? preTrick.tips : null;
  });
  const [stickFrequency, setStickFrequency] = useState(() => {
    return preTrick ? preTrick.stickFrequency : null;
  });

  var preId;
  if (preTrick) {
    preId = preTrick.id;
  }

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trick = {
      id: preId,
      alias: alias,
      technicalName: technicalName,
      establishedBy: establishedBy,
      yearEstablished: yearEstablished,
      linkToVideo: linkToVideo,
      startPos: startPos,
      endPos: endPos,
      difficultyLevel: difficultyLevel,
      description: description,
      tips: tips,
      stickFrequency: stickFrequency
    };
    
    db.saveTrick(trick)
    .then(() => {
      console.log(trick);
      history.push('/');
    })
  }

  const freqList = stickFrequencies.map((item, i) => {
    return (
      <option value={i}>{item}</option>
    )
  });

  const positionList = positions.map((item, i) => {
    return (
      <option value={i}>{item}</option>
    )
  });

  return (
    <div className="post">
      <h2>{preTrick ? "Update trick" : "Add a new trick"}</h2>
      <form onSubmit={handleSubmit} className="">
        <div className="row form-row">
          <div className="col-md-6">
            <label className="">Alias:</label>
            <input
              className="form-control"
              type="text"
              value={alias}
              placeholder="Darth Vader"
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Technical Name:</label>
            <input
              className="form-control"
              type="text"
              required
              value={technicalName}
              placeholder="Antihero to feet"
              onChange={(e) => setTechnicalName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Established By:</label>
            <input
              className="form-control"
              type="text"
              value={establishedBy}
              placeholder="Ian Eisenberg"
              onChange={(e) => setEstablishedBy(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Year Established:</label>
            <input
              className="form-control"
              type="number"
              value={yearEstablished}
              placeholder="2021"
              onChange={(e) => setYearEstablished(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Link to Video:</label>
            <input
              className="form-control"
              type="text"
              value={linkToVideo}
              placeholder="https://youtu.be/Ab2gW1rv5e8?t=91"
              onChange={(e) => setLinkToVideo(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Start Position:</label>
            <select
              className="form-control"
              required
              value={startPos}
              placeholder="HANG"
              onChange={(e) => setStartPos(e.target.value)}
            >
              {positionList}
            </select>
          </div>
          <div className="col-md-6">
            <label className="">End Position:</label>
            <select
              className="form-control"
              required
              value={endPos}
              placeholder="EXPOSURE"
              onChange={(e) => setEndPos(e.target.value)}
            >
              {positionList}
            </select>
          </div>
          <div className="col-md-6">
            <label className="">Difficulty Level:</label>
            <input
              className="form-control"
              type="number"
              required
              value={difficultyLevel}
              placeholder="8"
              onChange={(e) => setDifficultyLevel(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Description:</label>
            <input
              className="form-control"
              type="text"
              required
              value={description}
              placeholder="From hanging do a front flip motion and land in EXPOSURE"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Tips:</label>
            <input
              className="form-control"
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Stick Frequency:</label>
            <select className="form-select" onChange={(e) => setStickFrequency(e.target.value)}>
              {freqList}
            </select>
          </div>
        </div>
        
        <button className="btn btn-primary">{preTrick ? "Update Trick" : "Add Trick"}</button>
        
      </form>
    </div>
  );
}

export default PostTrick;
