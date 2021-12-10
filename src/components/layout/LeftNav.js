import { Link, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { links } from "../../links";
import { pages } from '../../services/enums';
import { parentPageOf, parentPageMatches } from '../../services/parentPage';
import Visibility from '../../components/containers/Visibility';
import { trickSortingSchemes, comboSortingSchemes } from '../../services/sortingSchemes';

const LeftNav = ({ sortOpt, setSortOpt, setShowAboutPage }) => {
  const path = useLocation().pathname.toString().toLowerCase();
  const inTrickList = path === "/" ? true : false;
  const inComboList = path === "/combos" ? true : false;
  const parentPage = parentPageOf(path);

  return (
    <div className="hide-on-mobile left-navigation p-3 text-white bg-dark" style={{width: '280px'}}>
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
        <span className="fs-4 text-white">Highline Freestyle</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {
          links.map((link) => {
            return <li className="nav-item" key={link.url}>
              <a href={link.url} className={parentPageMatches(parentPage, link.url) ? "nav-link active" : "nav-link text-white"} aria-current="page">
              {link.name}
              </a>
            </li>;
          })
        }
      </ul>
      <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]}>
        <h6>{inTrickList && "Sort Tricks"}{inComboList && "Sort Combos"}</h6>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto option-pills">
          { inTrickList && trickSortingSchemes.map(scheme =>
            <li className="nav-item" key={scheme.id}>
              <a href="#" className={sortOpt === scheme.id ? "nav-link active" : "nav-link text-white"} onClick={() => setSortOpt(scheme.id)}>{scheme.name}</a>
            </li>)
          }
          { inComboList && comboSortingSchemes.map(scheme =>
            <li className="nav-item" key={scheme.id}>
              <a href="#" className={sortOpt === scheme.id ? "nav-link active" : "nav-link text-white"} onClick={() => setSortOpt(scheme.id)}>{scheme.name}</a>
            </li>)
          }
        </ul>
      </Visibility>
      <hr />
      <a href="#" onClick={() => setShowAboutPage(true)} >About</a>
    </div>
  );
}

export default LeftNav;
