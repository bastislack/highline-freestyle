import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

import Database from "../services/db";
const db = new Database();

const RandomCombo = () => {

  // Get combo count or initialize with 1
  var comboCount = parseInt(localStorage.getItem('randomComboCount')) || 1;

  const history = useHistory();

  const combo = history.location.state.combo;
  
  console.log(combo)

  // If the user wants to save the combo it is added to the database
  const saveToCombos = () => {
    const currentYear = new Date().getFullYear();
    const name = "Random #" + comboCount;

    const savedCombo = {
      name: name,
      tricks: combo,
      stickFrequency: "Never",
      establishedBy: "Generator",
      linkToVideo: "",
      comments: "This combo was randomly generated!",
      yearEstablished: currentYear
    }

    db.saveCombo(savedCombo)
      .then(() => {
        console.log("savedCombo");
      })
      .catch(e => {
        console.log(e);
      });

    // Increment number of generated combos by 1 so all the combos have unique names
    localStorage.setItem('randomComboCount', comboCount + 1);
  };

  return (
    <div className="random-combo">
      <h2>Generated Combo</h2>
      {combo.map(trick => (
        <div className="row callout" key={trick.id}>
          <p>{trick.alias || trick.technicalName}</p>
        </div>
      ))}
      <div className="container row">
        <Link className="col-sm-6 form-button" to={`/combos`}>
          <button className="btn btn-primary" onClick={saveToCombos}>Add to Combos</button>
        </Link>
        <Link to={`/generator`} className="col-sm-6 form-button">
          <button className="btn btn-primary">Go back to Generator</button>
        </Link>

      </div>

    </div>
  );
}

export default RandomCombo;
