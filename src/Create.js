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
      <form onSubmit={handleSubmit} className="">
        <div className="row form-row">
          <div className="col-md-6">
            <label className="">Alias:</label>
            <input
              className="form-control"
              type="text"
              required
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Technical Name:</label>
            <input
              className="form-control"
              type="text"
              required
              value={technicalName}
              onChange={(e) => setTechnicalName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="">Start Position:</label>
            <select
              className="form-control"
              value={startPos}
              onChange={(e) => setStartPos(e.target.value)}
            >
              <option value="KOREAN">KOREAN</option>
              <option value="SOFA">SOFA</option>
              <option value="EXPOSURE">EXPOSURE</option>
              <option value="HANG">HANG</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="">End Position:</label>
            <select
              className="form-control"
              value={endPos}
              onChange={(e) => setEndPos(e.target.value)}
            >
              <option value="KOREAN">KOREAN</option>
              <option value="SOFA">SOFA</option>
              <option value="EXPOSURE">EXPOSURE</option>
              <option value="HANG">HANG</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="">Description:</label>
            <input
              className="form-control"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
          <button className="btn btn-primary">Add Trick</button>
        
      </form>
    </div>
  );
}

export default Create;
