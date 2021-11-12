import { Link } from "react-router-dom";
import BackButton from "../buttons/BackButton";

const Navbar = () => {
  return (
    <nav className="navbar">
      <BackButton/>
      <Link to={`/`} className="navbar-brand">
        <h1>Highline Freestyle</h1>
      </Link>
    </nav>
  );
}
 
export default Navbar;
