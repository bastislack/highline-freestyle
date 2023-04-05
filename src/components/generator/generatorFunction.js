import arePositionsSimilar from '../../logic/combos/similarPositions';

/**
 * Heuristically generates a random combo which adheres to the specified conditions.
 * @param {*} conditions Conditions that the combo must meet
 * @param {number} retries Number of times to retry when generating a combo fails
 */
export function generateRandomCombo(conditions, retries= 0) {
  conditions = {
    tricks: undefined,
    positions: [],
    numberOfTricks: 10,
    startFromCheckbox: false,
    startingPositionIndex: 0,
    allowDuplicates: false,
    allowConsecutiveTricks: false,
    allowSimilarPositions: true,
    allowTransitions: false,
    mustFinishToFeet: true,
    avgDifficulty: -1,
    minDifficulty: 0,
    maxDifficulty: 11,
    ...conditions
  };

  if (retries >= 100) {
    alert("could not find a combo, try changing the settings");
    return;
  }

  if (conditions.numberOfTricks <= 1) {
    alert("You need more than one trick for a combo!");
    return;
  }

  const randomTricks = [];
  let availableTricks = [...conditions.tricks];

  if (availableTricks.length === 0) {
    alert("can't find a single trick which fits these settings, try changing them");
    return;
  }

  try {
    let startingPosition = conditions.positions[conditions.startingPositionIndex];
    randomTricks.push(firstTrick(availableTricks, conditions.startFromCheckbox, startingPosition));
  } catch (err) {
    alert(err);
    return;
  }
  let sumOfDifficulties = randomTricks[0].difficultyLevel;

  for (let i = 1; i < conditions.numberOfTricks; i++) {
    let possibleTricks = availableTricks.filter(
        trick => areLocalComboConditionsLegal(i, randomTricks[i-1], trick, conditions)
            && (conditions.allowDuplicates || !randomTricks.includes(trick))
    );

    // can't find any tricks anymore... try again
    if (possibleTricks.length === 0){
      return generateRandomCombo(conditions, retries+1);
    }

    if (conditions.avgDifficulty === -1) {
      randomTricks.push(getRandomEntryOfArray(possibleTricks));
    } else {
      randomTricks.push(randomTrickOfAvgDifficulty(
          possibleTricks,
          conditions.maxDifficulty,
          conditions.avgDifficulty,
          sumOfDifficulties,
          i));
      sumOfDifficulties += randomTricks[i].difficultyLevel;
    }
  }

  return randomTricks;
}

/**
 * Returns true if the current trick is a legal one in regard to the specified conditions. This does not check for
 * duplicates as it only looks at one trick and its predecessor in the combo.
 */
function areLocalComboConditionsLegal(index, lastTrick, currentTrick, conditions) {
  const isConsecutiveTricksLegal = conditions.allowConsecutiveTricks || lastTrick.id !== currentTrick.id;

  const isEndAndStartEqual = currentTrick.startPos === lastTrick.endPos;
  const isLegalSimilar = arePositionsSimilar(currentTrick.startPos, lastTrick.endPos) && conditions.allowSimilarPositions;
  const isTransitionLegal = isLegalSimilar || isEndAndStartEqual || conditions.allowTransitions;

  if (!isConsecutiveTricksLegal || !isTransitionLegal) {
    return false;
  }

  if (conditions.mustFinishToFeet && index === conditions.numberOfTricks - 1) {
    return ["STAND", "EXPOSURE"].includes(currentTrick.endPos);
  }

  return true;
}

/**
 * Find the first trick depending on whether it needs to be from a certain starting position or not.
 */
function firstTrick(availableTricks, isStartPositionFixed, startPosition) {
  if (!isStartPositionFixed) {
    return getRandomEntryOfArray(availableTricks);
  }
  let possibleTricks = availableTricks.filter(trick => trick.startPos === startPosition);
  if (possibleTricks.length === 0) {
    throw "The selected options do not contain any trick with the specified starting position.";
  }
  return getRandomEntryOfArray(possibleTricks);
}

/**
 * This adds a heuristics which chooses tricks depending on how it fits towards the expected avgDifficulty,
 * but the difficultyLevels are modified with a random value of a Normal Distribution (which is depending on how
 * extreme the avgDifficulty is), to have some additional randomness and not get always the same combo.
 * Original Author: weberax
 */
function randomTrickOfAvgDifficulty(possibleTricks, maxDifficulty, avgDifficulty, sumOfDifficulties, i) {
  for (let j = 0; j < possibleTricks.length; j++) {
    possibleTricks[j].randomDiff = calculateRandomDiffForTrick(maxDifficulty, avgDifficulty, possibleTricks, j);
  }
  possibleTricks.sort(
      (a, b) => {
        let difficultyScoreA = Math.abs(avgDifficulty - (sumOfDifficulties + a.randomDiff) / (i + 1));
        let difficultyScoreB = Math.abs(avgDifficulty - (sumOfDifficulties + b.randomDiff) / (i + 1));
        return difficultyScoreB - difficultyScoreA;
      }
  );
  return possibleTricks[possibleTricks.length - 1];
}

/**
 * Not entirely clear what this does. The function was extracted from the randomTrickOfAvgDifficulty function for
 * easier readability.
 * Original Author: weberax
 */
function calculateRandomDiffForTrick(maxDifficulty, avgDifficulty, possibleTricks, j) {
  let min = -maxDifficulty + 2 * Math.abs(maxDifficulty / 2 - avgDifficulty);
  let max = maxDifficulty - 2 * Math.abs(maxDifficulty / 2 - avgDifficulty);
  return possibleTricks[j].difficultyLevel + randomNormalDist(min, max);
}

/**
 * Random value with a Normal Distribution.
 * Calculated through a Box-Muller transformation, based on this thread:
 * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
 */
function randomNormalDist(min, max) {
  let u = 1 - Math.random();
  let v = 1 - Math.random();
  let rand = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

  rand = rand / 10.0 + 0.5;
  rand = Math.max(0, Math.min(rand, 1));

  return (max - min) * rand + min;
}


/**
 * Returns a random element of a given array. Returns undefined if the array is of length 0.
 */
function getRandomEntryOfArray(arr) {
  if(arr.length === 0) {
    return undefined;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}