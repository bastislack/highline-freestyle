import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import TricksDataService from "../services/tricks.js"

const ComboGenerator = () => {

  const [tricks, setTricks] = useState([]);
  const [numberOfTricks, setNumberOfTricks] = useState('');

  useEffect(() => {
    retrieveTricks();
  }, []);

  const retrieveTricks = () => {
    TricksDataService.getAll()
      .then(res => {
        console.log(res.data);
        setTricks(res.data.tricks);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const history = useHistory();

  const generateCombo = (e) => {
    e.preventDefault();

    if (numberOfTricks < 2) {
      console.log("You need more than one trick for a combo!");
      return;
    }

    let randomCombo = new Array(numberOfTricks);

    // Shuffle array of tricks
    tricks.sort(function(a, b){return 0.5 - Math.random()});

    // Get the first trick for the random combo
    randomCombo[0] = tricks.shift();
    
    // Iteratively shuffle array of tricks and find the first trick
    // that has a starting position that matches with the
    // ending position of the trick before
    // 
    // Right now the tricks that are used in the random combo
    // are removed from the tricks array so every trick is only
    // used once in the random combo
    for (let i = 1; i < numberOfTricks; i++) {
      let trickFound = false;
      tricks.sort(function(a, b){return 0.5 - Math.random()});
      for (let j = 0; j < tricks.length; j++) {
        if (tricks[j].startPos === randomCombo[i-1].endPos) {
          randomCombo[i] = tricks[j];
          tricks.splice(j,1);
          trickFound = true;
          break;
        }
      }
      if (!trickFound) {
        console.log("No suitable trick found");
        return;
      }
    }
    history.push({
      pathname: '/random-combo',
      state: { combo: randomCombo}
    });
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
        <button className="btn btn-primary">Generate</button>
      </form>
    </div>
  );
}
 
export default ComboGenerator;
