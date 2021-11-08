import { useState } from "react";
import { useHistory } from "react-router-dom";

import Database from "../services/db";
const db = new Database();

const CreateTrick = ({stickFrequencies, positions}) => {
  const [alias, setAlias] = useState('Darth Vader');
  const [technicalName, setTechnicalName] = useState('Antihero to feet');
  const [establishedBy, setEstablishedBy] = useState('Ian Eisenberg');
  const [yearEstablished, setYearEstablished] = useState(2021);
  const [linkToVideo, setLinkToVideo] = useState('');
  const [startPos, setStartPos] = useState('HANG');
  const [endPos, setEndPos] = useState('EXPOSURE');
  const [difficultyLevel, setDifficultyLevel] = useState(5);
  const [description, setDescription] = useState('');
  const [tips, setTips] = useState('');
  const [stickFrequency, setStickFrequency] = useState('Impossible');

  console.log(startPos);

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trick = {
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

  console.log(endPos);

  return (
    <div className="create">
      <h2>Add a new trick</h2>
      <form onSubmit={handleSubmit} className="">
        <div className="row form-row">
          <div className="col-md-6">
            <label className="">Alias:</label>
            <input
              className="form-control"
              type="text"
              value={alias}
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
              onChange={(e) => setTechnicalName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Established By:</label>
            <input
              className="form-control"
              type="text"
              value={establishedBy}
              onChange={(e) => setEstablishedBy(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Year Established:</label>
            <input
              className="form-control"
              type="number"
              value={yearEstablished}
              onChange={(e) => setYearEstablished(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Link to Video:</label>
            <input
              className="form-control"
              type="text"
              value={linkToVideo}
              onChange={(e) => setLinkToVideo(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Start Position:</label>
            <select
              className="form-control"
              required
              value={startPos}
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
        
          <button className="btn btn-primary">Add Trick</button>
        
      </form>
    </div>
  );
}

export default CreateTrick;
