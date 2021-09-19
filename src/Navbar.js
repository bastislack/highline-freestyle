import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to={`/`} className="navbar-brand">
        <h1>Highline Freestyle</h1>
      </Link>
    </nav>
  );
}
 
export default Navbar;