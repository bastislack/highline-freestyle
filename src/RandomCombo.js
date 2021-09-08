import { useHistory } from "react-router-dom";

{/* TODO: Pass random combo as prop */}
const RandomCombo = () => {
  const history = useHistory();

  return (
    <div className="random-combo">
      <h2>Generated Combo</h2>
      { history.location.state.combo.map(trick => (
          <p>{trick.name}</p>
      ))}
      <button>Add to Combos</button>
      <button>Go back to Generator</button>
    </div>
  );
}
 
export default RandomCombo;
