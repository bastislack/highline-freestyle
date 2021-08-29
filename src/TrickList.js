import { Link } from 'react-router-dom';

const TrickList = ({ tricks }) => {

  return (
    <div className="trick-list">
      {tricks.map(trick => (
        <button className="trick-preview" key={trick.id} >
          <Link className="link-to-trick" to={`/tricks/${trick.id}`}>
            <h2>{ trick.name }</h2>
          </Link>
        </button>
      ))}
    </div>
  );
}
 
export default TrickList;
