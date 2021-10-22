import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {

  const path = useLocation().pathname.toString().toLowerCase();

  let currentPage = path; 

  return (
    <nav className="bottomNav fixed-bottom justify-content-evenly">
        <Link to={`/`} className="col">
          <h1 className={(path === "/" | path.includes("tricks") | path === "/createtrick") && "nav-elem-selected"}>Tricks</h1>
        </Link>
        <Link to={`/combos`} className="col">
          <h1 className={(path.includes("/combos") | path === "/createcombo") && "nav-elem-selected"}>Combos</h1>
        </Link>
        <Link to={`/generator`} className="col">
          <h1 className={(path === "/generator" | path === "/random-combo") && "nav-elem-selected"}>Combo Generator</h1>
        </Link>
    </nav>
  );
}
 
export default BottomNav;
