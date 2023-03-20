import {useLocation} from "react-router-dom";
import {links} from "../../links";
import {pages} from "../../services/enums";
import {parentPageOf, parentPageMatches} from "../../services/parentPage";
import Visibility from "../containers/Visibility";
import {trickSortingSchemes, comboSortingSchemes} from "../../services/sortingSchemes";
import {Nav} from "react-bootstrap";
import {Link} from "react-router-dom";
import LanguageSelector from "../buttons/LanguageSelector";
import { RootContextData } from "../../routes/root";


const LeftNav = ({sortingOption, setSortingOption, setShowAboutPage} : RootContextData) => {
  const path = useLocation().pathname.toString().toLowerCase();
  const inTrickList = path === "/";
  const inComboList = path === "/combos";
  const parentPage = parentPageOf(path);
  if (!parentPage) {
    console.log("TODO: Handle Null Parent Page");
  }

  return (
    <div className="hide-on-mobile left-navigation">
      <a href="/" className="text-decoration-none">
        <span className="fs-4 text-white">Highline Freestyle</span>
      </a>
      <hr />
      <Nav variant="pills" className="flex-column mb-auto">
        {links.map((link) => {
          return (
            <Nav.Item key={link.url}>
              <Link
                to={link.url}
                className={parentPageMatches(parentPage!, link.url) ? "nav-link active" : "nav-link text-white"}
              >
                {link.name}
              </Link>
            </Nav.Item>
          );
        })}
      </Nav>
      <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]}>
        <h6>
          {inTrickList && "Sort Tricks"}
          {inComboList && "Sort Combos"}
        </h6>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto option-pills">
          {inTrickList &&
            trickSortingSchemes.map((scheme) => (
              <Nav.Item key={scheme.id}>
                <Nav.Link
                  className={sortingOption === scheme.id ? "active" : "text-white"}
                  onClick={() => setSortingOption(scheme.id)}
                >
                  {scheme.name}
                </Nav.Link>
              </Nav.Item>
            ))}
          {inComboList &&
            comboSortingSchemes.map((scheme) => (
              <Nav.Item key={scheme.id}>
                <Nav.Link
                  className={sortingOption === scheme.id ? "active" : "text-white"}
                  onClick={() => setSortingOption(scheme.id)}
                >
                  {scheme.name}
                </Nav.Link>
              </Nav.Item>
            ))}
        </ul>
      </Visibility>
      <hr />
      <LanguageSelector />
      <div className="row mt-1">
        <a className="col-8" href="https://forms.gle/Kg1Kydh8tqG4f7Vv8" target="_blank">
          Propose new trick
        </a>
        <a className="col-4" href="#" onClick={() => setShowAboutPage(true)}>
          About
        </a>
      </div>
    </div>
  );
};

export default LeftNav;
