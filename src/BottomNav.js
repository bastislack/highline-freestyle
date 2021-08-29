import { Link } from "react-router-dom";

const BottomNav = () => {
  return (
    <nav className="bottomNav">
      <Link to={`/`}>
        <h1>Tricks</h1>
      </Link>
      <Link to={`/combos`}>
        <h1>Combos</h1>
      </Link>
      <Link to={`/generator`}>
        <h1>Combo Generator</h1>
      </Link>
    </nav>
  );
}
 
export default BottomNav;
