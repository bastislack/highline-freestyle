import { useParams, useHistory } from "react-router-dom";
import { useState, useEffect } from "react"

const ComboDetails = () => {
  const history = useHistory();
  const { id } = useParams();
  const [combo, setCombo] = useState(null);


  useEffect(() => {
    retrieveCombo(id);
  }, []); 

  const retrieveCombo = (id) => {
    // TODO
    //CombosDataService.get(id)
    //  .then(res => {
    //    console.log(res.data);
    //    setCombo(res.data.combo);
    //  })
    //  .catch(e => {
    //    console.log(e);
    //  });
  };

  const deleteCombo = () => {
    CombosDataService.delete(id)
      .then(res => {
        console.log(res.data);
      })
      .catch(e => {
        console.log(e);
      });

    history.push('/combos');
  };

  return (
    <div className="combo-details">
      {combo && (
        <article>
          <h2>{combo.name}</h2>
          {combo.tricks.map(trick => (
            <div className="row callout" key={trick._id}>
              <p>{trick.alias || trick.technicalName}</p>
            </div>
          ))}
          <button onClick={deleteCombo} className="btn btn-primary">Delete Combo</button>
        </article>
      )}
    </div>
  );
}

export default ComboDetails;
