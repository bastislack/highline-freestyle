import { Link } from "react-router-dom";

const BottomNav = () => {
  return (
    <nav className="bottomNav fixed-bottom justify-content-evenly">
        <Link to={`/`} className="col">
          <h1>Tricks</h1>
        </Link>
        <Link to={`/combos`} className="col">
          <h1>Combos</h1>
        </Link>
        <Link to={`/generator`} className="col">
          <h1>Combo Generator</h1>
        </Link>
    </nav>
  );
}
 
export default BottomNav;
