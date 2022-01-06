import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import computeStats from '../../logic/combos/computeStats';
import { stickFrequencies, positions } from '../../services/enums';

import Database from "../../services/db";
const db = new Database();

const PostCombo = ({ userCombo }) => {

  const navigate = useNavigate();
  const location = useLocation();
  let preCombo;
  if(location.state){
    preCombo = location.state.preCombo;
  }

  const [name, setName] = useState(() => {
    return preCombo ? preCombo.name : "";
  });
  const [establishedBy, setEstablishedBy] = useState(() => {
    return preCombo ? preCombo.establishedBy : "";
  });
  const [yearEstablished, setYearEstablished] = useState(() => {
    return preCombo ? preCombo.yearEstablished : null;
  });
  const [linkToVideo, setLinkToVideo] = useState(() => {
    return preCombo ? preCombo.linkToVideo : "";
  });
  const [startPos, setStartPos] = useState(() => {
    return preCombo ? positions.findIndex(item => item === preCombo.startPos) : positions.findIndex(item => item === "STAND");
  });
  const [endPos, setEndPos] = useState(() => {
    return preCombo ? positions.findIndex(item => item === preCombo.endPos): positions.findIndex(item => item === "EXPOSURE");
  });
  const [minDiff, setMinDiff] = useState(() => {
    return preCombo ? preCombo.minDiff : null;
  });
  const [maxDiff, setMaxDiff] = useState(() => {
    return preCombo ? preCombo.maxDiff : null;
  });
  const [avgDiff, setAvgDiff] = useState(() => {
    return preCombo ? preCombo.avgDiff : null;
  });
  const [totalDiff, setTotalDiff] = useState(() => {
    return preCombo ? preCombo.totalDiff : null;
  });
  const [numberOfTricks, setNumberOfTricks] = useState(() => {
    return preCombo ? preCombo.numberOfTricks : null;
  });
  const [comments, setComments] = useState(() => {
    return preCombo ? preCombo.description : "";
  });
  const [stickFrequency, setStickFrequency] = useState(() => {
    return preCombo ? preCombo.stickFrequency : 0;
  });

  useEffect(() => {
    const { minDiff, maxDiff, avgDiff, totalDiff, numberOfTricks } = computeStats(userCombo);
    setMinDiff(minDiff);
    setMaxDiff(maxDiff);
    setAvgDiff(avgDiff);
    setTotalDiff(totalDiff);
    setNumberOfTricks(numberOfTricks);
  }, [userCombo]);

  var preId;
  if (preCombo) {
    preId = preCombo.id;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const combo = {
      id: preId,
      tricks: userCombo,
      name: name,
      establishedBy: establishedBy,
      yearEstablished: yearEstablished,
      linkToVideo: linkToVideo,
      startPos: startPos,
      endPos: endPos,
      minDiff: minDiff,
      maxDiff: maxDiff,
      avgDiff: avgDiff,
      totalDiff: totalDiff,
      numberOfTricks: numberOfTricks,
      comments: comments,
      stickFrequency: stickFrequency
    };
    
    db.saveCombo(combo)
    .then(() => {
      console.log(combo);
      navigate('/combos');
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

  const addTrickToCombo = () => navigate("/", { state: {addTrickToCombo: true, preCombo: preCombo }});

  return (
    <div className="post">
      <h2>{preCombo ? "Update combo" : "Add a new combo"}</h2>

      <div className="tricksInUserCombo">
      {userCombo &&
        <div className="row">
          {userCombo.map(trick => (
            <div className="col-12">
              <Link className="link-to-trick " to={`/tricks/${trick.id}`} key={"trick" + trick.id} >
                <button className="btn trick-preview skillFreq" freq={trick.stickFrequency}>
                  <h2>{trick.alias || trick.technicalName}</h2>
                </button>
              </Link>
            </div>
          ))}
        </div>
      }
      </div>


      <button onClick={addTrickToCombo}>+</button>

      {userCombo &&
        <div className="row">
          <h4>Combo stats:</h4>
          <p>Number of tricks: {numberOfTricks}</p>
          <p>Mininum difficulty level: {minDiff}</p>
          <p>Maximum difficulty level: {maxDiff}</p>
          <p>Average difficulty level: {avgDiff}</p>
          <p>Total difficulty level: {totalDiff}</p>
        </div>
      }

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
              placeholder="STAND"
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
