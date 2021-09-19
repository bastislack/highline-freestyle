import { useParams } from "react-router-dom";
import useFetch from "./useFetch";

const TrickDetails = () => {
  const { id } = useParams();
  console.log(id)
  const { data: trick, error, isPending } = useFetch('http://localhost:8000/tricks/' + id);

  return (
    <div className="trick-details">
      { isPending && <div>Loading...</div> }
      { error && <div>{ error }</div> }
      { trick && (
        <article>
          <h2>{ trick.name }</h2>
          <h3>Start from: </h3>
          <div className="callout">{ trick.startPos}</div>
          <h3>End in: </h3>
          <div className="callout">{ trick.endPos}</div>
          <h3>Description: </h3>
          <div className="callout">{ trick.description }</div>
        </article>
      )}
    </div>
  );
}
 
export default TrickDetails;
