import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import RandomCombo from './RandomCombo';

import Database from "../../services/db";
const db = new Database();

const ComboGenerator = ({difficultyRangeMax}) => {

  const [numberOfTricks, setNumberOfTricks] = useState('');

  const [removeTricks, setRemoveTricks] = useState(true);

  const [allowConsecutiveTricks, setConsecutiveTricks] = useState(false);

  const [maxDifficulty, setMaxDifficulty] = useState(difficultyRangeMax);

  const [showCombo, setShowCombo] = useState(false);

  const [combo, setCombo] = useState("");

  const tricks = useLiveQuery(() => db.getAllTricks(), []);
  if (!tricks) return null

  const arePositionsSimilar = (startPos, endPos) => {
    if ((startPos === "KOREAN" && (endPos === "CHEST" || endPos === "BACK")) || (startPos === "CHEST" && endPos === "KOREAN") || (startPos === "BACK" && endPos === "KOREAN") || (startPos === "EXPOSURE" && endPos === "STAND") || (startPos === "STAND" && endPos === "EXPOSURE")) {
      return true;
    } else {
      return false;
    }
  }

  const generateCombo = (e) => {
    e.preventDefault();

    if (numberOfTricks < 1) {
      alert("the number of tricks can't be negative or 0");
      return;
    } else if (numberOfTricks === 1) {
      alert("You need more than one trick for a combo!");
      return;
    }

    let randomCombo = new Array(numberOfTricks);
    let myTricks = [...tricks];

    let stuckPos;
    let removedTrick;

    // maximum retries until the generator stops
    let maxRetries = 100;
    let retries = 0;

    // Shuffle array of tricks
    let shuffleTricks = () => myTricks.sort((a, b) => 0.5 - Math.random());
    shuffleTricks();

    // Get the first trick for the random combo
    randomCombo[0] = myTricks[0];
    if (removeTricks) removedTrick = myTricks.shift();

    // Iteratively shuffle array of tricks and find the first trick
    // that has a starting position that matches with the
    // ending position of the trick before
    //
    // If it cant find a continuation it will try again until maxRetries
    for (let i = 1; i < numberOfTricks; i++) {
      if (retries > maxRetries) return alert("couldn't find combo");

      let trickFound = false;
      shuffleTricks();
      let lastPos = randomCombo[i - 1].endPos;
      for (let j = 0; j < myTricks.length; j++) {
        if ((arePositionsSimilar(myTricks[j].startPos, lastPos) || myTricks[j].startPos === lastPos) && (allowConsecutiveTricks || randomCombo[i - 1] !== myTricks[j])) {
          randomCombo[i] = myTricks[j];
          if (removeTricks) removedTrick = myTricks.splice(j, 1);
          trickFound = true;
          console.log("found trick");
          break;
        }
      }
      // if no trick is found the last iteration of the loop is repeated
      // but if it gets stuck on the same position twice, it starts from the begingin
      if (!trickFound) {
        retries++;
        console.log("No suitable trick, from position: " + lastPos + " found, removing last trick");
        if (i === 1 || lastPos === stuckPos) {
          console.log("starting new");
          myTricks = [...tricks];
          shuffleTricks();
          randomCombo[0] = myTricks[0];
          i = 0;
        } else {
          if (removeTricks) myTricks.push(removedTrick);
          i = i - 2;
        }
        stuckPos = lastPos;
      }
    }

    //check integrety of combo
    for (let i = 1; i < randomCombo.length; i++) {
      let prev = randomCombo[i - 1];
      let trick = randomCombo[i];
      if (prev.endPos !== trick.startPos && !arePositionsSimilar(trick.startPos, prev.endPos)) {
        alert("trick generator is broken");
      }
    }

    setCombo(randomCombo);
    setShowCombo(true);
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
            onChange={(e) => setNumberOfTricks(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="maxDifficultyRange" className="form-label">Max difficulty: {maxDifficulty}</label>
          <input type="range" className="form-range" onChange={(e) => setMaxDifficulty(e.target.value)} min="1" max={difficultyRangeMax} step="1" id="maxDifficultyRange" />
        </div>
        <div className="form-row form-check">
          <label className="form-check-label">Allow duplicates</label>
          <input
            defaultValue="False"
            className="form-check-input"
            type="checkbox"
            onChange={(e) => setRemoveTricks(e.target.checked == false)}
          />
        </div>
        <div className="form-row form-check">
          <label className="form-check-label">Allow consecutive tricks</label>
          <input
            defaultValue="False"
            className="form-check-input"
            type="checkbox"
            onChange={(e) => setConsecutiveTricks(e.target.checked)}
          />
        </div>
        <button className="btn btn-primary">Generate</button>
      </form>
      <br />
      {showCombo && <RandomCombo combo={combo} />}
    </div>
  );
}

export default ComboGenerator;
