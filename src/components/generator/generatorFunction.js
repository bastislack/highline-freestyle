export function findCombo(tricks, positions, numberOfTricks, startFromCheckbox, startFromPosition, allowDuplicates, allowConsecutiveTricks, finishToFeet, retries) {

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
      const possibleTricks = availableTricks.filter(trick => trick.startPos === positions[startFromPosition])
      return possibleTricks[Math.floor(Math.random() * possibleTricks.length)];
    }
    else {
      //random element
      return availableTricks[Math.floor(Math.random() * availableTricks.length)];
    }
  }

  const getRandomNumber = (min, max) => Math.random() * (max-min) + min;

  if (!retries) retries =0;
  if (retries >= 100) return alert("could not find a combo, try changing the settings");

  if (numberOfTricks <= 1) {
    alert("You need more than one trick for a combo!");
    return;
  }

  let randomTricks = new Array(numberOfTricks);
  let availableTricks = [...tricks];

  if (availableTricks.length == 0) return alert("can't find a single trick which fits these settings, try changing them")


  // Get the first trick for the random combo
  randomTricks[0] = getFirstTrick(availableTricks);
  let sumOfDifficulties = randomTricks[0].difficultyLevel;

  for (let i = 1; i < numberOfTricks; i++) {
    let possibleTricks = availableTricks.filter(
      trick => isAnyComboConditionFulfilled(i, randomTricks[i-1], trick)
      && (allowDuplicates || !randomTricks.includes(trick))
    );
    // can't find any tricks anymore... try again
    if (possibleTricks.length == 0) return findCombo(tricks, positions, numberOfTricks, startFromCheckbox, startFromPosition, allowDuplicates, allowConsecutiveTricks, finishToFeet, retries+1)
    //TODO this is an aproach for an heuristics, which tries too find tricks to fit to a certain avgDifficulty... but also has randomness
    // add random value to difficulty
    //for (let j = 0; j < possibleTricks.length; j++) {
    //  possibleTricks[j].randomDiff = possibleTricks[j].difficultyLevel + getRandomNumber(-randomness,randomness);
    //}
    //const avgDifficulty = 3;
    //const randomness = 10;
    //possibleTricks.sort(
    //  (a,b) => (
    //    // heuristics for finding a combo with certain avrDifficultie
    //    Math.abs(avgDifficulty - (sumOfDifficulties + b.randomDiff)/(i+1)) - Math.abs(avgDifficulty - (sumOfDifficulties + a.randomDiff)/(i+1))
    //  )
    //);
    //randomTricks[i] = possibleTricks[possibleTricks.length - 1];
    
    // take an random trick
    randomTricks[i] = possibleTricks[Math.floor(Math.random()*possibleTricks.length)];
    sumOfDifficulties += possibleTricks.difficultyLevel;
  }

  //check integrety of combo
  for (let i = 1; i < randomTricks.length; i++) {
    let prev = randomTricks[i - 1];
    let trick = randomTricks[i];
    if (prev.endPos !== trick.startPos && !arePositionsSimilar(trick.startPos, prev.endPos)) {
      return alert("trick generator is broken");
    }
  }

  return randomTricks;
}
