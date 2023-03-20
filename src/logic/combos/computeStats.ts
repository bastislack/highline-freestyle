const computeStats = (tricksInCombo) => {
  console.log("Compute stats of:", tricksInCombo);
  let minDiff = Infinity;
  let maxDiff = -Infinity;
 
  let totalDiff = 0;

  tricksInCombo.map((trick) => {
    if (trick.difficultyLevel < minDiff) {
      minDiff = parseInt(trick.difficultyLevel);
    }
    if (trick.difficultyLevel > maxDiff) {
      maxDiff = parseInt(trick.difficultyLevel);
    }
    totalDiff += parseInt(trick.difficultyLevel);
  });

  const avgDiff = Math.round((totalDiff / tricksInCombo.length + Number.EPSILON) * 100) / 100;

  return {
    minDiff: minDiff,
    maxDiff: maxDiff,
    avgDiff: avgDiff,
    totalDiff: totalDiff,
    numberOfTricks: tricksInCombo.length,
  };
};

export default computeStats;
