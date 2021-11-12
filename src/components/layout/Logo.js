import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to={`/`} className="navbar-brand">
      <h1>Highline Freestyle</h1>
    </Link>
  );
}

export default Logo;
