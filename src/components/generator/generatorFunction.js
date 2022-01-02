export function findCombo(tricks, positions, numberOfTricks, startFromCheckbox, startFromPosition, allowDuplicates, allowConsecutiveTricks, finishToFeet) {

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
      return alert("trick generator is broken");
    }
  }

  return randomTricks;
}
