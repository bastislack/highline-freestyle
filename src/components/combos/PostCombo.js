import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import computeStats from '../../logic/combos/computeStats';
import { stickFrequencies, positions } from '../../services/enums';
import ComboDetails from './ComboDetails';
import AddButton from '../buttons/AddButton';

import Database from "../../services/db";
const db = new Database();

const PostCombo = ({ userCombo, setUserCombo }) => {

  const navigate = useNavigate();
  const location = useLocation();
  let preCombo;
  if(location.state){
    preCombo = location.state.preCombo;
    if (!userCombo) {
      setUserCombo(preCombo);
    }
  }

  const [name, setName] = useState(() => {
    return preCombo ? preCombo.name : "";
  });
  const [establishedBy, setEstablishedBy] = useState(() => {
    return preCombo ? preCombo.establishedBy : "";
  });
  const [yearEstablished, setYearEstablished] = useState(() => {
    return preCombo ? preCombo.yearEstablished : new Date().getFullYear();
  });
  const [linkToVideo, setLinkToVideo] = useState(() => {
    return preCombo ? preCombo.linkToVideo : "";
  });
  const [minDiff, setMinDiff] = useState(() => {
    return preCombo && !userCombo ? preCombo.minDiff : userCombo ? userCombo.minDiff : null;
  });
  const [maxDiff, setMaxDiff] = useState(() => {
    return preCombo && !userCombo ? preCombo.maxDiff : userCombo ? userCombo.maxDiff : null;
  });
  const [avgDiff, setAvgDiff] = useState(() => {
    return preCombo && !userCombo ? preCombo.avgDiff : userCombo ? userCombo.avgDiff : null;
  });
  const [totalDiff, setTotalDiff] = useState(() => {
    return preCombo && !userCombo ? preCombo.totalDiff : userCombo ? userCombo.totalDiff : null;
  });
  const [numberOfTricks, setNumberOfTricks] = useState(() => {
    return preCombo && !userCombo ? preCombo.numberOfTricks : userCombo ? userCombo.numberOfTricks : null;
  });
  const [comments, setComments] = useState(() => {
    return preCombo ? preCombo.description : "";
  });
  const [stickFrequency, setStickFrequency] = useState(() => {
    return preCombo ? preCombo.stickFrequency : 0;
  });

  var preId;
  if (preCombo) {
    preId = preCombo.id;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    userCombo.tricks = userCombo.tricks.map(trick => trick.id);

    const combo = {
      id: preId,
      tricks: userCombo.tricks,
      name: name,
      establishedBy: establishedBy,
      yearEstablished: yearEstablished,
      linkToVideo: linkToVideo,
      startPos: userCombo.startPos,
      endPos: userCombo.endPos,
      minDiff: userCombo.minDiff,
      maxDiff: userCombo.maxDiff,
      avgDiff: userCombo.avgDiff,
      totalDiff: userCombo.totalDiff,
      numberOfTricks: userCombo.numberOfTricks,
      comments: comments,
      stickFrequency: stickFrequency,
      boostSkill: userCombo.boostSkill
    };
    
    setUserCombo(null);

    db.saveCombo(combo)
    .then(() => {
      console.log(combo);
      setTimeout(() => {navigate('/combos')}, 1);
    })
  }

  const freqList = stickFrequencies.map((item, i) => {
    return (
      <option key={i} value={i}>{item}</option>
    )
  });

  const positionList = positions.map((item, i) => {
    return (
      <option key={i} value={i}>{item}</option>
    )
  });

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    if (year < 0 || year > new Date().getFullYear()) {
      setYearEstablished(new Date().getFullYear());
    } else {
      setYearEstablished(year);
    }
  };

  const addTrickToCombo = () => navigate("/", { state: {addTrickToCombo: true, preCombo: preCombo }});
  const test = () => navigate("/");

  return (
    <div className="post">
      <h2>{preCombo ? "Update combo" : "Add a new combo"}</h2>

      {userCombo && <ComboDetails setUserCombo={setUserCombo} comboToShow={userCombo} addTrickToCombo={addTrickToCombo}/>}
      {!userCombo && <AddButton call={addTrickToCombo} />}

      <form onSubmit={handleSubmit} className="">
        <div className="row form-row">
          <div className="col-md-6">
            <label className="">Name:</label>
            <input
              className="form-control"
              required
              type="text"
              value={name}
              placeholder="Ian's Classic"
              onChange={(e) => setName(e.target.value)}
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
            <label className="">Comments:</label>
            <input
              className="form-control"
              type="text"
              value={comments}
              placeholder="Don't mess up the Yoda Roll in the end!"
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Stick Frequency:</label>
            <select className="form-select" onChange={(e) => setStickFrequency(e.target.value)}>
              {freqList}
            </select>
          </div>
        </div>
        
        <button className="btn btn-primary">{preCombo ? "Update Combo" : "Add Combo"}</button>
        
      </form>
    </div>
  );
}

export default PostCombo;
