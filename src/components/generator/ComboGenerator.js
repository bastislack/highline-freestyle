import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import ComboDetails from '../combos/ComboDetails';
import { stickFrequencies, positions } from '../../services/enums';
import useLocalStorage from '../hooks/useLocalStorage';
import computeStats from '../../logic/combos/computeStats';
import { findCombo } from './generatorFunction';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Trans, defineMessage } from '@lingui/macro';
import { i18n } from '@lingui/core';

import Database from "../../services/db";
const db = new Database();

defineMessage({ id: "comboGeneratorPage.generator", message: "Generator" });
defineMessage({ id: "comboGeneratorPage.randomlyGenerated", message: "This combo was randomly generated!" });
defineMessage({ id: "comboGeneratorPage.random", message: "Random" });

const ComboGenerator = ({ difficultyRangeMax, randomCombo, setRandomCombo }) => {

  const navigate = useNavigate();

  const [generatedCombosCount, setGeneratedCombosCount] = useLocalStorage('randomComboCount', 1);

  const [numberOfTricks, setNumberOfTricks] = useState('');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [allowConsecutiveTricks, setConsecutiveTricks] = useState(false);
  const [allowSimilarPositions, setAllowSimilarPositions] = useState(true);
  const [allowTransitions, setAllowTransitions] = useState(false);
  const [avgDifficulty, setAvgDifficulty] = useState(-1);
  const [comboName, setComboName] = useState(i18n._("comboGeneratorPage.random") + " #" + generatedCombosCount);
  const [startFromPosition, setStartFromPosition] = useState(positions.findIndex(item => item === "EXPOSURE"));
  const [finishToFeet, setFinishToFeet] = useState(true);
  const [consecutiveCheckbox, setConsecutiveCheckbox] = useState(false);
  const [startFromCheckbox, setStartFromCheckbox] = useState(false);
  const [difficultyWhitelist, setDifficultyWhitelist] = useState(Array.from({length: difficultyRangeMax}, (_, i) => i+1));
  const [stickFrequencyWhitelist, setStickFrequencyWhitelist] = useState(Array.from({length: stickFrequencies.length - 1}, (_, i) => i+1));
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
    const randomTricks = findCombo([tricks, positions, numberOfTricks, startFromCheckbox, startFromPosition, allowDuplicates, allowConsecutiveTricks, allowSimilarPositions, allowTransitions, finishToFeet, avgDifficulty, maxDifficulty]);

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
      stickFrequency: 0,
      establishedBy: i18n._("comboGeneratorPage.generator"),
      linkToVideo: "",
      comments: i18n._("comboGeneratorPage.randomlyGenerated"),
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
      <h2><Trans id="comboGeneratorPage.generateRandomCombo">Generate a Random Combo</Trans></h2>
      <form onSubmit={generateCombo}>
        <div className="row form-row">
          <label><Trans id="comboGeneratorPage.numberOfTricks">Number of Tricks</Trans>:</label>
          <input
            className="form-control"
            type="number"
            required
            value={numberOfTricks}
            onChange={(e) => setNumberOfTricks(parseInt(e.target.value ?? '0'))}
          />
        </div>
        <div className="difficultyRangeGenerator">
          <label htmlFor="diffRange" className="form-label"><Trans id="comboGeneratorPage.difficultyRange">Difficulty Range</Trans>:</label>
          <Range id="diffRange" step={1} value={difficultyRangeMinMax} min={0} max={difficultyRangeMax} marks={diffMarksOnRange} onChange={refreshDifficultyRangeMinMax}/>
        </div>
        <div className="form-row">
          <button className="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#advancedDifficultyOptions" aria-expanded="false" aria-controls="collapseExample">
            <Trans id="comboGeneratorPage.advancedOptions">Advanced Options</Trans>
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
                <label className="form-check-label"><Trans id="comboGeneratorPage.approximateAverageDifficulty">Approximate average difficulty (the more tricks the more accurate)</Trans>: {avgDifficulty > 0 && avgDifficulty}</label>
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
                <label className="form-check-label"><Trans id="comboGeneratorPage.finishToFeet">Finish to Feet</Trans></label>
                <input
                  checked={finishToFeet}
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) => setFinishToFeet(e.target.checked)}
                />
              </div>
              <hr/>
              <div className="form-row form-check">
                <label className="form-check-label"><Trans id="comboGeneratorPage.startFrom">Start from</Trans>:</label>
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
                  <label className="form-check-label"><Trans id="comboGeneratorPage.allowDuplicateTricks">Allow duplicate tricks</Trans></label>
                  <input
                    id="input_chkbx_duplicates"
                    className="form-check-input"
                    type="checkbox"
                    onClick={(e) => setAllowDuplicates(e.target.checked)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label id="consecutiveTricksLabel" className={allowDuplicates ? "form-check-label" : "form-check-label text-muted"}>
                    <Trans id="comboGeneratorPage.allowConsecutiveTricks">Allow consecutive tricks</Trans>
                  </label>
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
                  <label className="form-check-label"><Trans id="comboGeneratorPage.allowSimilarPositions">Allow similar positions</Trans></label>
                  <input
                    id="input_chkbx_similar_pos"
                    checked={allowSimilarPositions}
                    className="form-check-input"
                    type="checkbox"
                    onChange={(e) => setAllowSimilarPositions(e.target.checked)}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label className="form-check-label"><Trans id="comboGeneratorPage.allowTransitions">Allow transitions</Trans></label>
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
            <button className="col-12 btn btn-primary"><Trans id="comboGeneratorPage.generate">Generate</Trans></button>
          </div>
          {randomCombo && (
            <div className="col">
              <button className="col-12 btn btn-primary" onClick={saveToCombos}><Trans id="comboGeneratorPage.addToCombos">Add to Combos</Trans></button>
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
