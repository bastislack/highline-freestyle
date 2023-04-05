import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import ComboDetails from '../combos/ComboDetails';
import { stickFrequencies, positions } from '../../services/enums';
import useLocalStorage from '../hooks/useLocalStorage';
import computeStats from '../../logic/combos/computeStats';
import { generateRandomCombo } from './generatorFunction';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import Database from "../../services/db";
const db = new Database();

const ComboGenerator = ({ difficultyRangeMax, randomCombo, setRandomCombo }) => {

  const navigate = useNavigate();

  const [generatedCombosCount, setGeneratedCombosCount] = useLocalStorage('randomComboCount', 1);

  const [numberOfTricks, setNumberOfTricks] = useState('');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [allowConsecutiveTricks, setConsecutiveTricks] = useState(false);
  const [allowSimilarPositions, setAllowSimilarPositions] = useState(true);
  const [allowTransitions, setAllowTransitions] = useState(false);
  const [avgDifficulty, setAvgDifficulty] = useState(-1);
  const [comboName, setComboName] = useState("Random #" + generatedCombosCount);
  const [startFromPosition, setStartFromPosition] = useState(positions.findIndex(item => item === "EXPOSURE"));
  const [finishToFeet, setFinishToFeet] = useState(true);
  const [consecutiveCheckbox, setConsecutiveCheckbox] = useState(false);
  const [startFromCheckbox, setStartFromCheckbox] = useState(false);
  const [difficultyWhitelist, setDifficultyWhitelist] = useState(Array.from({length: difficultyRangeMax}, (_, i) => i+1));
  const [stickFrequencyWhitelist, setStickFrequencyWhitelist] = useState(Array.from({length: stickFrequencies.length}, (_, i) => i));
  const [difficultyRangeMinMax, setDifficultyRangeMinMax] = useState([1, difficultyRangeMax]);

  const maxDifficulty = difficultyRangeMinMax[1];
  const minDifficulty = difficultyRangeMinMax[0];

  let diffMarksOnRange = {};
  for (let i = 0; i <= difficultyRangeMax; i++){
    diffMarksOnRange[i] = i;
  }

  useEffect(() => {
    console.log("diffList:", difficultyWhitelist, "freqList:", stickFrequencyWhitelist, "toFeet:", finishToFeet);
  }, [difficultyWhitelist, stickFrequencyWhitelist]);

  // Contains all freqs that should be included from the combo
  function updateFreqItem(e) {
    if (e.target.checked) {
      setStickFrequencyWhitelist(stickFrequencyWhitelist.concat(Number(e.target.value)))
    }
    else {
      setStickFrequencyWhitelist(stickFrequencyWhitelist.filter(n => n !== Number(e.target.value)))
    }
  }

  const tricks = useLiveQuery(() => db.getTricksByDiffAndByFreq(difficultyWhitelist,stickFrequencyWhitelist), [difficultyWhitelist, stickFrequencyWhitelist]);
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
    setTimeout(() => {navigate("/combos")}, 100);
  };


  const generateCombo = (e) => {
    e.preventDefault();
    setRandomCombo(null);

    // find the combo with the given parameters
    let conditions = {
      tricks: tricks,
      positions: positions,
      numberOfTricks: numberOfTricks,
      startFromCheckbox: startFromCheckbox,
      startingPositionIndex: startFromPosition,
      allowDuplicates: allowDuplicates,
      allowConsecutiveTricks: allowConsecutiveTricks,
      allowSimilarPositions: allowSimilarPositions,
      allowTransitions: allowTransitions,
      mustFinishToFeet: finishToFeet,
      avgDifficulty: avgDifficulty,
      minDifficulty: minDifficulty,
      maxDifficulty: maxDifficulty
    }
    const randomTricks = generateRandomCombo(conditions);

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

  const refreshDifficultyRangeMinMax = (diffMinMax) => {
    setDifficultyRangeMinMax(diffMinMax);

    let prevMaxDiff = maxDifficulty;
    let maxDiff = diffMinMax[1];
    let prevMinDiff = minDifficulty;
    let minDiff = diffMinMax[0];

    if (maxDiff < prevMaxDiff) {
      setDifficultyWhitelist(difficultyWhitelist.filter((level) => level <= maxDiff));
    } else if (maxDiff > prevMaxDiff) {
      let newDiffList = [...difficultyWhitelist];
      for (let i = 1; i <= maxDiff - prevMaxDiff; i++) {
        newDiffList.push(prevMaxDiff + i);
      }
      console.log("newDiffList:", newDiffList);
      setDifficultyWhitelist(newDiffList);
    }

    if (minDiff > prevMinDiff) {
      setDifficultyWhitelist(difficultyWhitelist.filter((level) => level >= minDiff));
    } else if (minDiff < prevMinDiff) {
      let newDiffList = [...difficultyWhitelist];
      for (let i = 1; i <=  prevMinDiff - minDiff; i++) {
        newDiffList.unshift(prevMinDiff - i);
      }
      console.log("newDiffList:", newDiffList);
      setDifficultyWhitelist(newDiffList);
    }

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
            onChange={(e) => setNumberOfTricks(parseInt(e.target.value ?? '0'))}
          />
        </div>
        <div className="difficultyRangeGenerator">
          <label htmlFor="diffRange" className="form-label">Difficulty Range:</label>
          <Range id="diffRange" step={1} value={difficultyRangeMinMax} min={0} max={difficultyRangeMax} marks={diffMarksOnRange} onChange={refreshDifficultyRangeMinMax}/>
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
                    if (e.target.checked) setAvgDifficulty(minDifficulty + (maxDifficulty - minDifficulty) / 2);
                    else setAvgDifficulty(-1);
                  }}
                />
                <input type="range"
                  disabled={avgDifficulty == -1}
                  className="form-range"
                  onChange={(e) => setAvgDifficulty(e.target.value)}
                  min={minDifficulty}
                  max={maxDifficulty}
                  defaultValue={minDifficulty + (maxDifficulty - minDifficulty) / 2}
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
                  <label id="consecutiveTricksLabel" className={allowDuplicates ? "form-check-label" : "form-check-label text-muted"}>Allow consecutive tricks</label>
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
              <hr/>
              <div className="form-row">
                <div className="form-check form-check-inline">
                  <label className="form-check-label">Allow similar positions</label>
                  <input
                    id="input_chkbx_similar_pos"
                    checked={allowSimilarPositions}
                    className="form-check-input"
                    type="checkbox"
                    onChange={(e) => setAllowSimilarPositions(e.target.checked)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label className="form-check-label">Allow transitions</label>
                  <input
                    id="transitions"
                    checked={allowTransitions}
                    className="form-check-input"
                    type="checkbox"
                    onChange={(e) => setAllowTransitions(e.target.checked)}
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
      {randomCombo && <ComboDetails comboToShow={randomCombo} />}
    </div>
  );
}

export default ComboGenerator;
