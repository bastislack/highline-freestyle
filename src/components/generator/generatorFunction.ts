import arePositionsSimilar from "../../logic/combos/similarPositions";
import {Trick} from "../../types/trick";

export function findCombo(vars: any, retries: number): any {
  const [
    tricks,
    positions,
    numberOfTricks,
    startFromCheckbox,
    startFromPosition,
    allowDuplicates,
    allowConsecutiveTricks,
    allowSimilarPositions,
    allowTransitions,
    finishToFeet,
    avgDifficulty,
    maxDifficulty,
  ] = vars;

  /**
   * Returns true if the current trick is a legal one in regards to the
   * specified conditions. This does not check for duplicates as it only
   * looks at one trick and its predecessor in the combo.
   */
  const areLocalComboContitionsLegal = (index: number, lastTrick: Trick, currentTrick: Trick) => {
    const isConsecutiveTricksLegal = allowConsecutiveTricks || lastTrick.id !== currentTrick.id;

    const isEndAndStartEqual = currentTrick.startPos === lastTrick.endPos;
    const isEndAndStartSimilar = arePositionsSimilar(currentTrick.startPos, lastTrick.endPos);
    const isTransitionLegal = (allowSimilarPositions && isEndAndStartSimilar) || isEndAndStartEqual || allowTransitions;

    if (!isConsecutiveTricksLegal || !isTransitionLegal) {
      return false;
    }

    // If the last trick should be to feet, return if that is the case.
    if (index === numberOfTricks - 1 && finishToFeet) {
      return ["STAND", "EXPOSURE"].includes(currentTrick.endPos);
    }

    return true;
  };

  const getFirstTrick = (availableTricks: Trick[]) => {
    if (startFromCheckbox) {
      const possibleTricks = availableTricks.filter((trick) => trick.startPos === positions[startFromPosition]);
      return possibleTricks[Math.floor(Math.random() * possibleTricks.length)];
    } else {
      //random element
      return availableTricks[Math.floor(Math.random() * availableTricks.length)];
    }
  };

  // random Normal Distribution with Box-Muller transformation
  const randomBoxMullerDistribution = (min: number, max: number) => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randomBoxMullerDistribution(min, max); // resample between 0 and 1 if out of range
    else {
      num *= max - min; // Stretch to fill range
      num += min; // offset to min
    }
    return num;
  };

  if (!retries) retries = 0;
  if (retries >= 100) return alert("could not find a combo, try changing the settings");

  if (numberOfTricks <= 1) {
    alert("You need more than one trick for a combo!");
    return;
  }

  const randomTricks = new Array(numberOfTricks);
  const availableTricks = [...tricks];

  if (availableTricks.length == 0)
    return alert("can't find a single trick which fits these settings, try changing them");

  // Get the first trick for the random combo
  randomTricks[0] = getFirstTrick(availableTricks);
  let sumOfDifficulties = randomTricks[0].difficultyLevel;

  for (let i = 1; i < numberOfTricks; i++) {
    const possibleTricks = availableTricks.filter(
      (trick) =>
        areLocalComboContitionsLegal(i, randomTricks[i - 1], trick) &&
        (allowDuplicates || !randomTricks.includes(trick))
    );
    // can't find any tricks anymore... try again
    if (possibleTricks.length == 0) return findCombo(vars, retries + 1);

    // this adds a heuristics which chooses tricks depending on how it fits towards the expected avgDifficulty,
    // but the difficultyLevels are modified with a random value of a Normal Distribution (which is depending on how extrem the avgDifficulty is),
    // to have some additional randomness and not get always the same combo
    if (avgDifficulty != -1) {
      for (let j = 0; j < possibleTricks.length; j++) {
        possibleTricks[j].randomDiff =
          possibleTricks[j].difficultyLevel +
          randomBoxMullerDistribution(
            -maxDifficulty + 2 * Math.abs(maxDifficulty / 2 - avgDifficulty),
            maxDifficulty - 2 * Math.abs(maxDifficulty / 2 - avgDifficulty)
          );
      }
      possibleTricks.sort(
        (a, b) =>
          // heuristics for finding a combo with certain avrDifficultie
          Math.abs(avgDifficulty - (sumOfDifficulties + b.randomDiff) / (i + 1)) -
          Math.abs(avgDifficulty - (sumOfDifficulties + a.randomDiff) / (i + 1))
      );
      randomTricks[i] = possibleTricks[possibleTricks.length - 1];
      sumOfDifficulties += randomTricks[i].difficultyLevel;
    } else {
      // take an random trick
      randomTricks[i] = possibleTricks[Math.floor(Math.random() * possibleTricks.length)];
    }
  }

  //check integrety of combo
  for (let i = 1; i < randomTricks.length; i++) {
    const prev = randomTricks[i - 1];
    const trick = randomTricks[i];
    if (prev.endPos !== trick.startPos && !arePositionsSimilar(trick.startPos, prev.endPos) && !allowTransitions) {
      return alert("trick generator is broken");
    }
  }

  return randomTricks;
}
