import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import ComboDetails from '../combos/ComboDetails';
import { stickFrequencies, positions } from '../../services/enums';
import useLocalStorage from '../hooks/useLocalStorage';

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
  const [difficultyWhitelist, setDifficultyWhitelist] = useState(Array.from({length: difficultyRangeMax}, (_, i) => i + 1));
  const [stickFrequencyWhitelist, setStickFrequencyWhitelist] = useState(Array.from(Array(7).keys()));

  // Contains all diff-levels that should be included from the combo
 /* function refreshDiffWhitelist(maxDiff) {
    let children = document.getElementById("specifyItemsDiv").childNodes;
    setDifficultyWhitelist(difficultyWhitelist.filter(level => level <= maxDiff));
    children.forEach(element => {
      let box = element.getElementsByTagName("input")[0]
      let boxVal = parseInt(box.value);
      if (box.checked) {
        if (!difficultyWhitelist.includes(boxVal)){
          let newWhitelist = difficultyWhitelist;
          newWhitelist.splice(boxVal, 0, boxVal);
          setDifficultyWhitelist(newWhitelist);
        }
      } else {
        if (difficultyWhitelist.includes(boxVal)){
          setDifficultyWhitelist(difficultyWhitelist.filter((level) => level !== boxVal));
        }
      } 
    });
  }*/

  useEffect(() => {
    console.log("diffList:", difficultyWhitelist, "freqList:", stickFrequencyWhitelist, "toFeet:", finishToFeet);
  }, [maxDifficulty, stickFrequencyWhitelist]);


  // Contains all freqs that should be included from the combo
  function refreshFreqWhitelist() {
    let children = document.getElementById("specifyStickFreqsDiv").childNodes
    children.forEach(element => {
      let box = element.getElementsByTagName("input")[0]
      let boxVal = parseInt(box.value);
      if (box.checked) {
        if (!stickFrequencyWhitelist.includes(boxVal)){
          let newWhitelist = stickFrequencyWhitelist;
          newWhitelist.splice(boxVal, 0, boxVal);
          setStickFrequencyWhitelist(newWhitelist);
        }
      } else {
        if (stickFrequencyWhitelist.includes(boxVal)){
          setStickFrequencyWhitelist(stickFrequencyWhitelist.filter((freq) => freq !== boxVal));
        }
      }
    });
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

  const arePositionsSimilar = (startPos, endPos) => {
    if ((startPos === "KOREAN" && (endPos === "CHEST" || endPos === "BACK")) || (startPos === "CHEST" && endPos === "KOREAN") || (startPos === "BACK" && endPos === "KOREAN") || (startPos === "EXPOSURE" && endPos === "STAND") || (startPos === "STAND" && endPos === "EXPOSURE") || (startPos === "BELLY" && endPos === "CHEST") || (startPos === "CHEST" && endPos === "BELLY")) {
      return true;
    } else {
      return false;
    }
  }

  const isAnyComboConditionFulfilled = (index, lastTrick, currentTrick) => {
    const isFinishToFeetFulfilled = (currentTrick.endPos === "STAND" || currentTrick.endPos === "EXPOSURE") ? true : false;
    const isConsecutiveTricksFulfilled = ((allowDuplicates && allowConsecutiveTricks) || lastTrick !== currentTrick) ? true : false;
    const isGeneralComboConstraintFulfilled = (arePositionsSimilar(currentTrick.startPos, lastTrick.endPos) || currentTrick.startPos === lastTrick.endPos) ? true : false;
    if (index === numberOfTricks - 1 && finishToFeet) {
      if (isGeneralComboConstraintFulfilled && isConsecutiveTricksFulfilled && isFinishToFeetFulfilled) {
        return true;
      }
    }
    else if (isGeneralComboConstraintFulfilled && isConsecutiveTricksFulfilled) {
      return true;
    }
    return false;
  }

  const getFirstTrick = (availableTricks) => {
    if (startFromCheckbox) {
      for (let i = 0; i < availableTricks.length; i++) {
        if (availableTricks[i].startPos === positions[startFromPosition]) {
          return ({ firstTrick: availableTricks[i], indexAvailableTricks: i });
        }
      }
    }
    else {
      return ({ firstTrick: availableTricks[0], indexAvailableTricks: 0 })
    }
  }

  const generateCombo = (e) => {
    e.preventDefault();

    setRandomCombo(null);

    if (numberOfTricks <= 1) {
      alert("You need more than one trick for a combo!");
      return;
    }

    let randomTricks = new Array(numberOfTricks);
    let availableTricks = [...tricks];

    let stuckPos;
    let removedTrick;

    // maximum retries until the generator stops
    let maxRetries = 100;
    let retries = 0;

    // Shuffle array of tricks
    let shuffleTricks = () => availableTricks.sort((a, b) => 0.5 - Math.random());
    shuffleTricks();

    // Get the first trick for the random combo
    const { firstTrick, indexAvailableTricks } = getFirstTrick(availableTricks);
    randomTricks[0] = firstTrick;
    if (!allowDuplicates) removedTrick = availableTricks.splice(indexAvailableTricks, 1);

    // Iteratively shuffle array of tricks and find the first trick
    // that has a starting position that matches with the
    // ending position of the trick before
    //
    // If it cant find a continuation it will try again until maxRetries
    for (let i = 1; i < numberOfTricks; i++) {
      if (retries > maxRetries) return alert("Couldn't find combo!");

      let trickFound = false;
      shuffleTricks();
      let lastTrick = randomTricks[i - 1];
      let lastPos = randomTricks[i - 1].endPos;
      for (let j = 0; j < availableTricks.length; j++) {
        if (isAnyComboConditionFulfilled(i, randomTricks[i - 1], availableTricks[j])) {
          randomTricks[i] = availableTricks[j];
          if (!allowDuplicates) removedTrick = availableTricks.splice(j, 1);
          trickFound = true;
          console.log("found trick: ", i + 1);
          break;
        }
      }
      // if no trick is found the last iteration of the loop is repeated
      // but if it gets stuck on the same position twice, it starts from the begingin
      if (!trickFound) {
        retries++;
        console.log("No suitable trick, after: " + lastTrick.technicalName + " from position: " + lastPos + " found, removing last trick");
        if (i === 1 || lastPos === stuckPos) {
          console.log("starting new");
          availableTricks = [...tricks];
          shuffleTricks();
          let { firstTrick, indexAvailableTricks } = getFirstTrick(availableTricks);
          randomTricks[0] = firstTrick;
          if (!allowDuplicates) removedTrick = availableTricks.splice(indexAvailableTricks, 1);
          i = 0;
        } else {
          if (!allowDuplicates) availableTricks.push(removedTrick);
          i = i - 2;
        }
        stuckPos = lastPos;
      }
    }

    //check integrety of combo
    for (let i = 1; i < randomTricks.length; i++) {
      let prev = randomTricks[i - 1];
      let trick = randomTricks[i];
      if (prev.endPos !== trick.startPos && !arePositionsSimilar(trick.startPos, prev.endPos)) {
        alert("trick generator is broken");
      }
    }

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

  function toggleTouch(element) {
    var inp = document.getElementById(element.id);
    inp.classList.toggle("touch-button-active");
    inp.classList.toggle("touch-button-inactive");
  }

  /*function toggleAvgSlider(checked) {
    var avgDifficultyRange = document.getElementById("avgDifficultyRange");
    avgDifficultyRange.disabled = checked == false;

    refreshAvgSlider();
  }*/

  function toggleConsecutiveTricks(checked) {
    var consecutiveTricks = document.getElementById("consecutiveTricks");
    consecutiveTricks.disabled = checked == false;
    setConsecutiveCheckbox(checked == true);

    refreshConsecutiveTricks();
  }

  function toggleStartFrom(checked) {
    var selectStartFrom = document.getElementById("select_start_from");
    selectStartFrom.disabled = checked == false;
  }

  /*function refreshAvgSlider() {
    var avgDifficultyRange = document.getElementById("avgDifficultyRange");
    var checked = document.getElementById("input_chkbx_avg").checked;
    if (!checked) {
      avgDifficultyRange.value = 1;
      setAvgDifficulty(-1);
    } else {
      var halfdiff = maxDifficulty / 2;
      avgDifficultyRange.value = halfdiff;
      setAvgDifficulty(halfdiff);
    }
  }*/

  function refreshConsecutiveTricks() {
    var consecutiveTricks = document.getElementById("consecutiveTricks");
    consecutiveTricks.checked = false;
    setConsecutiveTricks(false);
  }

  const positionList = positions.map((item, i) => {
    return (
      <option value={i} key={i}>{item}</option>
    )
  });

  const changeMaxDiff = (maxDiff) => {
    let prevMaxDiff = difficultyWhitelist.at(-1);
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
    if (maxDiff < 4) {
      console.log("toggle finish to Feet");
      setFinishToFeet(false);
    } else {
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
    {/*<div className="form-row">

                <p>Allowed difficulty levels:</p>
                <div className="btn-group btn-group-toggle row btn-group-long-row" data-toggle="buttons" id="specifyItemsDiv">
                  {Array.from(Array(parseInt(maxDifficulty)).keys()).map(diffNr => {
                    diffNr++;
                    return (
                      <div className="col-3 col-sm-3 col-md-2 col-lg-1" key={diffNr}>
                        <input
                          id={"checkboxForLevel_" + diffNr}
                          value={diffNr}
                          className="btn-check"
                          type="checkbox"
                          defaultChecked
                          autoComplete="off"
                          onChange={e => refreshDiffWhitelist(maxDifficulty)} />
                        <label
                          id={"labelForLevel_" + diffNr}
                          className="btn allowedDiffButton touch-button-active"
                          htmlFor={"checkboxForLevel_" + diffNr}
                          onClick={(e) => toggleTouch(e.target)}
                        >{diffNr}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <hr/>*/}
              <div className="form-row">

                <p>Allowed stick frequencies:</p>
                <div className="btn-group btn-group-toggle row btn-group-long-row" data-toggle="buttons" id="specifyStickFreqsDiv">
                  {stickFrequencies.map((item, i) => {
                    return (
                      <label className="skillFreq form-check" freq={i} key={i}>
                        <input className="form-check-input" type="checkbox" value={i} name="stickFrequency" defaultChecked readOnly={true} onChange={e => refreshFreqWhitelist()} /> {item}
                      </label>
                    );
                  })}
                </div>
              </div>
              <hr/>
    {/*<div className="form-row form-check">
                <label className="form-check-label">Average difficulty {avgDifficulty > 0 && avgDifficulty}</label>
                <input
                  id="input_chkbx_avg"
                  defaultValue="False"
                  className="form-check-input"
                  type="checkbox"
                  onClick={(e) => toggleAvgSlider(e.target.checked)}
                />
                <input type="range"
                  disabled
                  className="form-range"
                  onChange={(e) => setAvgDifficulty(e.target.value)}
                  min="1"
                  max={maxDifficulty}
                  defaultValue={avgDifficulty}
                  step="0.5"
                  id="avgDifficultyRange" />
              </div>
              <hr/>*/}
              <div className="form-row form-check">
                <label className="form-check-label">Finish to Feet</label>
                <input
                  checked={finishToFeet}
                  className="form-check-input"
                  type="checkbox"
                  onClick={(e) => setFinishToFeet(e.target.checked)}
                />
              </div>
              <hr/>
              <div className="form-row form-check">
                <label className="form-check-label">Start from:</label>
                <input
                  id="start_from_chkbx"
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) => { toggleStartFrom(e.target.checked); setStartFromCheckbox(e.target.checked); }}
                />
                <select
                  id="select_start_from"
                  disabled
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
                    onClick={(e) => {
                      setAllowDuplicates(e.target.checked);
                      toggleConsecutiveTricks(e.target.checked);
                    }}
                  />
                </div>
                <div className="form-check form-check-inline">
                  <label id="consecutiveTricksLabel" className={consecutiveCheckbox ? "form-check-label" : "form-check-label text-muted"}>Allow consecutive tricks</label>
                  <input
                    disabled
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
