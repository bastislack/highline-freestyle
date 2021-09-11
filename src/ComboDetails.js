import { useParams } from "react-router-dom";
import useFetch from "./useFetch";

const ComboDetails = () => {
  const { id } = useParams();
  const { data: combo, error, isPending } = useFetch('http://localhost:7000/combos/' + id);

  return (
    <div className="combo-details">
      {isPending && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {combo && (
        <article>
          <h2>{combo.name}</h2>
          {combo.tricks.map(trick => (
            <div className="row callout">
              <p>{trick}</p>
            </div>
          ))}
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
