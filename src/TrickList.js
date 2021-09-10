import { Link } from 'react-router-dom';

const TrickList = ({ tricks }) => {

  return (
    <div className="justify-content-evenly">
      <div className="row">
      {tricks.map(trick => (
          <Link className="col-md-4 link-to-trick " to={`/tricks/${trick.id}`}>
            <button className=" btn btn-outline-success trick-preview" key={trick.id}>
              <h2>{ trick.name }</h2>
            </button>
          </Link>
      ))}
    </div>
    </div>
  );
}
 
export default TrickList;
