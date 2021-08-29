import { useState } from "react";
import { useHistory } from "react-router-dom";

const Create = () => {
  const [alias, setAlias] = useState('Darth Vader');
  const [technicalName, setTechnicalName] = useState('Antihero to feet');
  const [startPos, setStartPos] = useState('HANG');
  const [endPos, setEndPos] = useState('EXPOSURE');
  const [description, setDescription] = useState('');

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trick = { alias, technicalName, startPos, endPos, description };

    fetch('http://localhost:8000/tricks', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      content: JSON.stringify(trick)
    }).then(() => {
      console.log(trick);
      history.push('/');
    })
  }

  return (
    <div className="create">
      <h2>Add a new trick</h2>
      <form onSubmit={handleSubmit}>
        <label>Alias:</label>
        <input
          type="text"
          required
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <label>Technical Name:</label>
        <input
          type="text"
          required
          value={technicalName}
          onChange={(e) => setTechnicalName(e.target.value)}
        />
        <label>Start Position:</label>
        <select
          value={startPos}
          onChange={(e) => setStartPos(e.target.value)}
        >
          <option value="KOREAN">KOREAN</option>
          <option value="SOFA">SOFA</option>
          <option value="EXPOSURE">EXPOSURE</option>
          <option value="HANG">HANG</option>
        </select>
        <label>End Position:</label>
        <select
          value={endPos}
          onChange={(e) => setEndPos(e.target.value)}
        >
          <option value="KOREAN">KOREAN</option>
          <option value="SOFA">SOFA</option>
          <option value="EXPOSURE">EXPOSURE</option>
          <option value="HANG">HANG</option>
        </select>
        <label>Description:</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button>Add Trick</button>
      </form>
    </div>
  );
}
 
export default Create;
