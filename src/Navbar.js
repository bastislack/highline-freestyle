import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to={`/`}>
        <h1>Highline Freestyle</h1>
      </Link>
      <Link to={`/create`}>
        <h1>Create Trick</h1>
      </Link>
    </nav>
  );
}
 
export default Navbar;
