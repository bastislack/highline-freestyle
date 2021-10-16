import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

const RandomCombo = () => {
  const history = useHistory();

  return (
    <div className="random-combo">
      <h2>Generated Combo</h2>
      {history.location.state.combo.map(trick => (
        <div className="row callout" key={trick._id}>
          <p>{trick.name}</p>
        </div>
      ))}
      <div className="container row">
        <Link className="col-sm-6 form-button" to={`/combos`}>
          <button className="btn btn-primary">Add to Combos</button>
        </Link>
        <Link to={`/generator`} className="col-sm-6 form-button">
          <button className="btn btn-primary">Go back to Generator</button>
        </Link>

      </div>

    </div>
  );
}

export default RandomCombo;
