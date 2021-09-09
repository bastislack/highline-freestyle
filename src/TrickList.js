import { Link } from 'react-router-dom';

const TrickList = ({ tricks }) => {

  return (
    <div className="justify-content-evenly row">
      {tricks.map(trick => (
          <button class="col-md-3 btn btn-outline-success trick-preview" key={trick.id} >
            <Link className="link-to-trick" to={`/tricks/${trick.id}`}>
              <h2>{ trick.name }</h2>
            </Link>
          </button>
      ))}
    </div>
  );
}
 
export default TrickList;
