import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { positions, stickFrequencies } from "../../services/enums";

import Database from "../../services/db";
import { Form, Button, InputGroup } from "react-bootstrap";
const db = new Database();

const PostTrick = () => {

  const location = useLocation();
  let preTrick = location.state?.preTrick;

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
    return preTrick ? preTrick.tips : [];
  });
  const [stickFrequency, setStickFrequency] = useState(() => {
    return preTrick ? preTrick.stickFrequency : 0;
  });

  let preId = preTrick?.id;

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

    // removes all attributes,which were not set or modified
    if (trick.alias == "" || !trick.alias || preTrick && trick.alias === preTrick.alias){ delete trick.alias }
    if (trick.technicalName == "" || !trick.technicalName || preTrick && trick.technicalName === preTrick.technicalName){ delete trick.technicalName }
    if (trick.establishedBy == "" || !trick.establishedBy || preTrick && trick.establishedBy === preTrick.establishedBy){ delete trick.establishedBy }
    if (trick.yearEstablished == "" || !trick.yearEstablished || preTrick && trick.yearEstablished === preTrick.yearEstablished){ delete trick.yearEstablished }
    if (trick.linkToVideo == "" || !trick.linkToVideo || preTrick && trick.linkToVideo === preTrick.linkToVideo){ delete trick.linkToVideo }
    if (trick.startPos == "" || !trick.startPos || preTrick && trick.startPos === preTrick.startPos){ delete trick.startPos }
    if (trick.endPos == "" || !trick.endPos || preTrick && trick.endPos === preTrick.endPos){ delete trick.endPos }
    if (trick.difficultyLevel == "" || !trick.difficultyLevel || preTrick && trick.difficultyLevel === preTrick.difficultyLevel){ delete trick.difficultyLevel }
    if (trick.description == "" || !trick.description || preTrick && trick.description === preTrick.description){ delete trick.description }
    if (trick.tips == [] || !trick.tips || preTrick && trick.tips === preTrick.tips){ delete trick.tips }
    
    db.saveTrick(trick)
    .then(() => {
      console.log(trick);
      setTimeout(() => {navigate('/')}, 1);
    })
  }

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    if (year < 0 || year > new Date().getFullYear()) {
      setYearEstablished(new Date().getFullYear());
    } else {
      setYearEstablished(year);
    }
  };

  const freqList = stickFrequencies.map((item, i) => {
    return (
      <option value={i} key={i}>{item}</option>
    )
  });

  const positionList = positions.map((item, i) => {
    return (
      <option value={i} key={i} >{item}</option>
    )
  });

  /**
   * Displays a variable length, editable list of tips. This function together with the following related ones are only
   * slightly altered versions of the ones from the following solution to the problem:
   * https://stackoverflow.com/a/59233716
   */
  function tipList() {
    return tips.map((elem, i) =>
      <InputGroup key={i}>
        <Form.Control
            type="text"
            className="form-control"
            value={elem||''}
            placeholder="Try this..."
            onChange={handleTipChange.bind(this, i)}
        />
        <Button
          type="button"
          variant="outline-danger"
          value="remove"
          name={i.toString()}
          onClick={removeTip.bind(i)}
        >
          Remove
        </Button>
      </InputGroup>
    );
  }

  function handleTipChange(i, event) {
    let tips_ = [...tips];
    tips_[i] = event.target.value;
    setTips(tips_);
  }

  const removeTip = event => {
    let index = Number(event.target.name);
    let tips_ = [...tips];
    tips_.splice(index, 1);
    setTips(tips_);
  };

  const addTipField = () => {
    setTips(tips => [...tips, '']);
  };


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
              placeholder={new Date().getFullYear()}
              onChange={(e) => handleYearChange(e)}
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
              onChange={(e) => {setDifficultyLevel(Math.max(0, e.target.value));}
            }
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
            <label className="">Stick Frequency:</label>
            <select className="form-select" onChange={(e) => setStickFrequency(Number(e.target.value))}>
              {freqList}
            </select>
          </div>
          <div className="col-md-6">
            <label>Tips:</label>
            {tipList()}
            <Button
                variant="outline-success"
                onClick={addTipField}
                className={tips.length !== 0 ? "mt-2" : "ms-2"}
            >
              Add Tip
            </Button>
          </div>
        </div>
        
        <button className="btn btn-primary">{preTrick ? "Update Trick" : "Add Trick"}</button>
        
      </form>
    </div>
  );
}

export default PostTrick;
