import ComboList from "./ComboList";
import useFetch from "../useFetch";

const ComboHome = () => {
  const { error, isPending, data: combos } = useFetch('http://localhost:7000/combos')

  return (
    <div className="combo-home">
      { error && <div>{ error }</div> }
      { isPending && <div>Loading...</div> }
      { combos && <ComboList combos={combos} /> }
    </div>
  );
}
 
export default ComboHome;
