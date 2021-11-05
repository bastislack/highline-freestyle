import { Link } from "react-router-dom";
import { useState } from "react";

import Database from "../services/db";
const db = new Database();

const RandomCombo = (props) => {

  // Get combo count or initialize with 1
  var comboCount = parseInt(localStorage.getItem('randomComboCount')) || 1;

  const combo = props.combo;

  const [comboName, setComboName] = useState("Random #" + comboCount);

  // If the user wants to save the combo it is added to the database
  const saveToCombos = () => {
    const currentYear = new Date().getFullYear();

    const savedCombo = {
      name: comboName,
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
      {combo.map(trick => (
        <div className="row callout" key={trick.id}>
          <p>{trick.alias || trick.technicalName}</p>
        </div>
      ))}
      <div className="container row">
        Name: <input value={comboName} onChange={e => setComboName(e.target.value)} />
        <Link className="col-sm-6 form-button" to={`/combos`}>
          <button className="btn btn-primary" onClick={saveToCombos}>Add to Combos</button>
        </Link>
      </div>
    </div>
  );
}

export default RandomCombo;
