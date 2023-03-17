import { useLocation } from "react-router-dom";
import { links } from "../../links";
import { parentPageOf, parentPageMatches } from '../../services/parentPage';
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import LanguageSelector from "../buttons/LanguageSelector"

const LeftNav = ({ setShowAboutPage }) => {
  const path = useLocation().pathname.toString().toLowerCase();
  const parentPage = parentPageOf(path);

  return (
    <div className="hide-on-mobile left-navigation">
      <a href="/" className="text-decoration-none">
        <span className="fs-4 text-white">Highline Freestyle</span>
      </a>
      <hr />
      <Nav variant="pills" className="flex-column mb-auto">
        {
          links.map((link) => {
            return <Nav.Item key={link.url}>
            <Link to={link.url} className={parentPageMatches(parentPage, link.url) ? "nav-link active" : "nav-link text-white"}>{link.name}</Link>
            </Nav.Item>
          })
        }
      </Nav>
      <hr />
      <LanguageSelector />
      <div className="row mt-1">
          <a className="col-8" href="https://forms.gle/Kg1Kydh8tqG4f7Vv8" target="_blank">Propose new trick</a>
          <a className="col-4" href="#" onClick={() => setShowAboutPage(true)}>About</a>
      </div>
    </div>
  );
}

export default LeftNav;
