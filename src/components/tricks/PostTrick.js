import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { positions, stickFrequencies } from "../../services/enums";
import { Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';

import Database from "../../services/db";
const db = new Database();

const PostTrick = () => {

  const location = useLocation();
  let preTrick;
  if(location.state){
    preTrick = location.state.preTrick;
  } else {
    console.log("location no state");
  }

  const [alias, setAlias] = useState(() => {
    return preTrick ? preTrick.alias : "";
  });
  const [technicalName, setTechnicalName] = useState(() => {
    return preTrick ? preTrick.technicalName : "";
  });
  const [establishedBy, setEstablishedBy] = useState(() => {
    return preTrick ? preTrick.establishedBy : "";
  });
  const [yearEstablished, setYearEstablished] = useState(() => {
    return preTrick ? preTrick.yearEstablished : new Date().getFullYear();
  });
  const [linkToVideo, setLinkToVideo] = useState(() => {
    return preTrick ? preTrick.linkToVideo : "";
  });
  const [startPos, setStartPos] = useState(() => {
    return preTrick ? positions.findIndex(item => item === preTrick.startPos) : positions.findIndex(item => item === "HANG");
  });
  const [endPos, setEndPos] = useState(() => {
    return preTrick ? positions.findIndex(item => item === preTrick.endPos): positions.findIndex(item => item === "EXPOSURE");
  });
  const [difficultyLevel, setDifficultyLevel] = useState(() => {
    return preTrick ? preTrick.difficultyLevel : "";
  });
  const [description, setDescription] = useState(() => {
    return preTrick ? preTrick.description : "";
  });
  const [tips, setTips] = useState(() => {
    return preTrick ? preTrick.tips : "";
  });
  const [stickFrequency, setStickFrequency] = useState(() => {
    return preTrick ? preTrick.stickFrequency : 0;
  });

  var preId;
  if (preTrick) {
    preId = preTrick.id;
  }

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trick = {
      id: preId,
      alias: alias,
      technicalName: technicalName,
      establishedBy: establishedBy,
      yearEstablished: parseInt(yearEstablished),
      linkToVideo: linkToVideo,
      startPos: positions[startPos],
      endPos: positions[endPos],
      difficultyLevel: parseInt(difficultyLevel),
      description: description,
      tips: tips,
      stickFrequency: stickFrequency
    };

    db.saveTrick(trick)
    .then(() => {
      console.log(trick);
      setTimeout(() => {navigate('/')}, 1);
    })
  }

  const freqList = stickFrequencies.map((item, i) => {
    return (
      <option value={i} key={i}>{i18n._(item.props['id'])}</option>
    )
  });

  const positionList = positions.map((item, i) => {
    return (
      <option value={i} key={i} >{item}</option>
    )
  });

  return (
    <div className="post">
      <h2>{preTrick ? <Trans id="postTrickPage.updateTrick">Update trick</Trans> : <Trans id="postTrickPage.addANewTrick">Add a new trick</Trans>}</h2>
      <form onSubmit={handleSubmit} className="">
        <div className="row form-row">
          <div className="col-md-6">
            <label className=""><Trans id="postTrickPage.alias">Alias</Trans>:</label>
            <input
              className="form-control"
              type="text"
              value={alias}
              placeholder="Darth Vader"
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className=""><Trans id="postTrickPage.technicalName">Technical Name</Trans>:</label>
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
            <label className=""><Trans id="common.establishedBy" />:</label>
            <input
              className="form-control"
              type="text"
              value={establishedBy}
              placeholder="Ian Eisenberg"
              onChange={(e) => setEstablishedBy(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className=""><Trans id="common.yearEstablished" />:</label>
            <input
              className="form-control"
              type="number"
              value={yearEstablished}
              placeholder={new Date().getFullYear()}
              onChange={(e) => setYearEstablished(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className=""><Trans id="common.linkToVideo" />:</label>
            <input
              className="form-control"
              type="text"
              value={linkToVideo}
              placeholder="https://youtu.be/Ab2gW1rv5e8?t=91"
              onChange={(e) => setLinkToVideo(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className=""><Trans id="postTrickPage.startPosition">Start Position</Trans>:</label>
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
            <label className=""><Trans id="postTrickPage.endPosition">End Position</Trans>:</label>
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
            <label className=""><Trans id="postTrickPage.difficultyLevel">Difficulty Level</Trans>:</label>
            <input
              className="form-control"
              type="number"
              required
              value={difficultyLevel}
              placeholder="8"
              onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
            />
          </div>
          <div className="col-md-6">
            <label className=""><Trans id="postTrickPage.description">Description</Trans>:</label>
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
            <label className=""><Trans id="postTrickPage.tips">Tips</Trans>:</label>
            <input
              className="form-control"
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className=""><Trans id="common.stickFrequency" />:</label>
            <select className="form-select" onChange={(e) => setStickFrequency(Number(e.target.value))}>
              {freqList}
            </select>
          </div>
        </div>

        <button className="btn btn-primary">{preTrick ? <Trans id="postTrickPage.updateTrickButton">Update Trick</Trans> : <Trans id="postTrickPage.addTrickButton">Add Trick</Trans>}</button>

      </form>
    </div>
  );
}

export default PostTrick;
