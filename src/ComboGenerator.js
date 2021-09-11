import { useState } from "react";
import { useHistory } from "react-router-dom";
import useFetch from "./useFetch";

const ComboGenerator = () => {
  const { error, isPending, data: tricks } = useFetch('http://localhost:8000/tricks')

  const [numberOfTricks, setNumberOfTricks] = useState('');

  const history = useHistory();

  const generateCombo = (e) => {
    e.preventDefault();

    if (numberOfTricks < 2) {
      console.log("You need more than one trick for a combo!");
      return;
    }

    let randomCombo = new Array(numberOfTricks);

    tricks.sort(function(a, b){return 0.5 - Math.random()});

    randomCombo[0] = tricks.shift();
    
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
    {/* TODO: pass combo to the random combo screen */}
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
