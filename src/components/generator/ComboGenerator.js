import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import ComboDetails from '../combos/ComboDetails';
import { stickFrequencies, positions } from '../../services/enums';
import useLocalStorage from '../hooks/useLocalStorage';
import { findCombo } from './generatorFunction'

import Database from "../../services/db";
const db = new Database();

const ComboGenerator = ({ difficultyRangeMax, randomCombo, setRandomCombo }) => {

  const navigate = useNavigate();

  const [generatedCombosCount, setGeneratedCombosCount] = useLocalStorage('randomComboCount', 1);

  const [numberOfTricks, setNumberOfTricks] = useState('');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [allowConsecutiveTricks, setConsecutiveTricks] = useState(false);
  const [maxDifficulty, setMaxDifficulty] = useState(difficultyRangeMax);
  const [avgDifficulty, setAvgDifficulty] = useState(-1);
  const [comboName, setComboName] = useState("Random #" + generatedCombosCount);
  const [startFromPosition, setStartFromPosition] = useState(positions.findIndex(item => item === "EXPOSURE"));
  const [finishToFeet, setFinishToFeet] = useState(true);
  const [consecutiveCheckbox, setConsecutiveCheckbox] = useState(false);
  const [startFromCheckbox, setStartFromCheckbox] = useState(false);
  const [difficultyWhitelist, setDifficultyWhitelist] = useState(Array.from({length: difficultyRangeMax + 1}, (_, i) => i));
  const [stickFrequencyWhitelist, setStickFrequencyWhitelist] = useState(Array.from(Array(7).keys()));

  useEffect(() => {
    console.log("diffList:", difficultyWhitelist, "freqList:", stickFrequencyWhitelist, "toFeet:", finishToFeet);
  }, [maxDifficulty, stickFrequencyWhitelist]);


  // Contains all freqs that should be included from the combo
  function updateFreqItem(e) {
    if (e.target.checked) {
      setStickFrequencyWhitelist(stickFrequencyWhitelist.concat(Number(e.target.value)))
    }
    else {
      setStickFrequencyWhitelist(stickFrequencyWhitelist.filter(n => n !== Number(e.target.value)))
    }
  }

  const tricks = useLiveQuery(() => db.getTricksByDiffAndByFreq(difficultyWhitelist,stickFrequencyWhitelist), [maxDifficulty, stickFrequencyWhitelist]);
  console.log(tricks);
  if (!tricks) return null

  // If the user wants to save the combo it is added to the database
  const saveToCombos = () => {
    db.saveCombo(randomCombo)
      .then(() => {
        console.log("savedCombo");
      })
      .catch(e => {
        console.log(e);
      });

    // Increment number of generated combos by 1 so all the combos have unique names
    setGeneratedCombosCount(generatedCombosCount + 1);
    setRandomCombo(null);
    navigate("/combos");
  };

  const computeStats = (tricksInCombo) => {
    let minDiff = Infinity;
    let maxDiff = -Infinity;
    let avgDiff;
    let totalDiff = 0;

    tricksInCombo.map(trick => {
      if (trick.difficultyLevel < minDiff) {
        minDiff = parseInt(trick.difficultyLevel);
      }
      if (trick.difficultyLevel > maxDiff) {
        maxDiff = parseInt(trick.difficultyLevel);
      }
      totalDiff += parseInt(trick.difficultyLevel);
    });

    avgDiff = Math.round((totalDiff / numberOfTricks + Number.EPSILON) * 100) / 100;

    return ({
      minDiff: minDiff,
      maxDiff: maxDiff,
      avgDiff: avgDiff,
      totalDiff: totalDiff,
      numberOfTricks: numberOfTricks,
    });
  }

  const generateCombo = (e) => {
    e.preventDefault();
    setRandomCombo(null);

    // find the combo with the given parameters
    const randomTricks = findCombo([tricks, positions, numberOfTricks, startFromCheckbox, startFromPosition, allowDuplicates, allowConsecutiveTricks, finishToFeet, avgDifficulty, maxDifficulty]); 

    const { minDiff, maxDiff, avgDiff, totalDiff } = computeStats(randomTricks);

    const currentYear = new Date().getFullYear();

    setRandomCombo({
      name: comboName,
      tricks: randomTricks,
      minDiff: minDiff,
      maxDiff: maxDiff,
      avgDiff: avgDiff,
      totalDiff: totalDiff,
      numberOfTricks: numberOfTricks,
      stickFrequency: "Never tried",
      establishedBy: "Generator",
      linkToVideo: "",
      comments: "This combo was randomly generated!",
      yearEstablished: currentYear
    });
  }

  const positionList = positions.map((item, i) => {
    return (
      <option value={i} key={i}>{item}</option>
    )
  });

  const changeMaxDiff = (maxDiff) => {
    let prevMaxDiff = difficultyWhitelist[difficultyWhitelist.length - 1];
    if (prevMaxDiff > maxDiff) {
      setDifficultyWhitelist(difficultyWhitelist.filter((level) => level <= maxDiff));
    } else {
      let newDiffList = difficultyWhitelist;
      for (let i = 1; i <= maxDiff - prevMaxDiff; i++) {
        newDiffList.push(prevMaxDiff + i);
      }
      console.log("newDiffList:", newDiffList);
      setDifficultyWhitelist(newDiffList);
    } 
    setMaxDifficulty(maxDiff);
    if (maxDiff < 4 && finishToFeet) {
      console.log("toggle finish to Feet");
      setFinishToFeet(false);
    } else if(maxDiff >= 4 && !finishToFeet) {
      console.log("toggle finish to Feet");
      setFinishToFeet(true);
    }
  }

  return (
    <div className="generator">
      <h2>Generate a Random Combo</h2>
      <form onSubmit={generateCombo}>
        <div className="row form-row">
          <label>Number of Tricks:</label>
          <input
            className="form-control"
            type="number"
            required
            value={numberOfTricks}
            onChange={(e) => setNumberOfTricks(parseInt(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label htmlFor="maxDifficultyRange" className="form-label">Max difficulty: {maxDifficulty}</label>
          <input type="range" className="form-range" onChange={(e) => changeMaxDiff(parseInt(e.target.value))} min="0" max={difficultyRangeMax} step="1" value={maxDifficulty} id="maxDifficultyRange" />
        </div>
        <div className="form-row">
          <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#advancedDifficultyOptions" aria-expanded="false" aria-controls="collapseExample">
            Advanced Options
          </button>

          <div className="collapse" id="advancedDifficultyOptions">
            <div className="card card-body">
              <div className="form-row">

                <p>Allowed stick frequencies:</p>
                <div className="btn-group btn-group-toggle row btn-group-long-row" data-toggle="buttons" id="specifyStickFreqsDiv">
                  {stickFrequencies.map((item, i) => {
                    return (
                      <label className="skillFreq form-check" freq={i} key={i}>
                        <input className="form-check-input" type="checkbox" value={i} name="stickFrequency" checked={stickFrequencyWhitelist.includes(i)} readOnly={true} onChange={e => updateFreqItem(e)} /> {item}
                      </label>
                    );
                  })}
                </div>
              </div>
              <hr/>
              <div className="form-row form-check">
                <label className="form-check-label">Approximate average difficulty (the more tricks the more accurate): {avgDifficulty > 0 && avgDifficulty}</label>
                <input
                  id="input_chkbx_avg"
                  defaultValue="False"
                  className="form-check-input"
                  type="checkbox"
                  onClick={(e) => {
                    if (e.target.checked) setAvgDifficulty(maxDifficulty / 2);
                    else setAvgDifficulty(-1);
                  }}
                />
                <input type="range"
                  disabled={avgDifficulty == -1}
                  className="form-range"
                  onChange={(e) => setAvgDifficulty(e.target.value)}
                  min="1"
                  max={maxDifficulty}
                  defaultValue={maxDifficulty / 2}
                  step="0.5"
                  id="avgDifficultyRange" />
              </div>
              <hr/>
              <div className="form-row form-check">
                <label className="form-check-label">Finish to Feet</label>
                <input
                  checked={finishToFeet}
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) => setFinishToFeet(e.target.checked)}
                />
              </div>
              <hr/>
              <div className="form-row form-check">
                <label className="form-check-label">Start from:</label>
                <input
                  id="start_from_chkbx"
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) => { setStartFromCheckbox(e.target.checked); }}
                />
                <select
                  id="select_start_from"
                  disabled={!startFromCheckbox}
                  className="form-control"
                  value={startFromPosition}
                  placeholder="EXPOSURE"
                  onChange={(e) => setStartFromPosition(e.target.value)}
                >
                  {positionList}
                </select>
              </div>
              <hr/>
              <div className="form-row">
                <div className="form-check form-check-inline">
                  <label className="form-check-label">Allow duplicate tricks</label>
                  <input
                    id="input_chkbx_duplicates"
                    className="form-check-input"
                    type="checkbox"
                    onClick={(e) => setAllowDuplicates(e.target.checked)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label id="consecutiveTricksLabel" className={consecutiveCheckbox ? "form-check-label" : "form-check-label text-muted"}>Allow consecutive tricks</label>
                  <input
                    disabled={!allowDuplicates}
                    id="consecutiveTricks"
                    defaultValue="False"
                    className="form-check-input"
                    type="checkbox"
                    onChange={(e) => setConsecutiveTricks(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-around">
          <div className="col">
            <button className="col-12 btn btn-primary">Generate</button>
          </div>
          {randomCombo && (
            <div className="col">
              <button className="col-12 btn btn-primary" onClick={saveToCombos}>Add to Combos</button>
            </div>
          )}
        </div>
      </form>
      <br />
      {randomCombo && <ComboDetails stickFrequencies={stickFrequencies} randomCombo={randomCombo} />}
    </div>
  );
}

export default ComboGenerator;
