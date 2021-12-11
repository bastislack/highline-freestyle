import { useLocation } from "react-router-dom";
import { links } from "../../links";
import { pages } from '../../services/enums';
import { parentPageOf, parentPageMatches } from '../../services/parentPage';
import Visibility from '../../components/containers/Visibility';
import { trickSortingSchemes, comboSortingSchemes } from '../../services/sortingSchemes';
import { Nav } from "react-bootstrap";

const LeftNav = ({ sortOpt, setSortOpt, setShowAboutPage }) => {
  const path = useLocation().pathname.toString().toLowerCase();
  const inTrickList = path === "/" ? true : false;
  const inComboList = path === "/combos" ? true : false;
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
              <Nav.Link href={link.url} className={parentPageMatches(parentPage, link.url) ? "active" : "text-white"}>
                {link.name}
              </Nav.Link>
            </Nav.Item>
          })
        }
      </Nav>
      <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]}>
        <h6>{inTrickList && "Sort Tricks"}{inComboList && "Sort Combos"}</h6>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto option-pills">
          { inTrickList && trickSortingSchemes.map(scheme =>
            <Nav.Item key={scheme.id}>
              <Nav.Link
                className={sortOpt === scheme.id ? "active" : "text-white"}
                onClick={() => setSortOpt(scheme.id)}>
                {scheme.name}
              </Nav.Link>
            </Nav.Item>)
          }
          { inComboList && comboSortingSchemes.map(scheme =>
            <Nav.Item key={scheme.id}>
              <Nav.Link
                className={sortOpt === scheme.id ? "active" : "text-white"}
                onClick={() => setSortOpt(scheme.id)}>
                {scheme.name}
              </Nav.Link>
            </Nav.Item>)
          }
        </ul>
      </Visibility>
      <hr />
      <a href="#" onClick={() => setShowAboutPage(true)} >About</a>
    </div>
  );
}

export default LeftNav;
