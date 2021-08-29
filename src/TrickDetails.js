import { useParams } from "react-router-dom";
import { useState } from "react";
import useFetch from "./useFetch";

const TrickDetails = () => {
  const { id } = useParams();
  console.log(id)
  const { data: trick, error, isPending } = useFetch('http://localhost:8000/tricks/' + id);

  const [skillFreq, setSkillFreq] = useState("");

  const freqs = [
    {name: "Impossible", color: "white"},
    {name: "Only once", color: "red"},
    {name: "Rarely", color: "LightPink"},
    {name: "Sometimes", color: "LightYellow"},
    {name: "Generally", color: "LightGreen"},
    {name: "Always", color: "LightSkyBlue"}
  ];

  const freqList = freqs.map((item, i) => {
    return (
      <option value={i} background={item.color}>{item.name}</option>
    )
  });

  const selectFreq = (e) => {
    setSkillFreq(e.target.value);
    trick.skillFreq = skillFreq;
    //TODO: save this to database...
  }

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
          <div className="skillFreq">Set your success frequency:
            <select value={trick.skillFreq} onChange={(e) => selectFreq(e)}>
              {freqList}
            </select>
          </div>
        </article>
      )}
    </div>
  );
}
 
export default TrickDetails;
