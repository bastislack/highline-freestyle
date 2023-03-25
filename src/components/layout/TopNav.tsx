import {Navbar, Container} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import Visibility from "../containers/Visibility";
import BackButton from "../buttons/BackButton";
//import InstallButton from "../buttons/InstallButton";
import {parentPageOf} from "../../services/parentPage";
import Settings from "./Settings";
import {RootContextData} from "../../routes/root";

interface TopNavProps {
  rootContext: RootContextData;
}

const TopNav = (props: TopNavProps) => {
  const parentPage = parentPageOf(useLocation().pathname.toString().toLowerCase());
  const {sortingOption, setSortingOption, setShowAboutPage, setShowResetWarning} = props.rootContext;

  return (
    <Navbar variant="dark" expand="lg" className="top-navigation">
      <Container fluid>
        <div className="navigation-button-container">
          <Visibility
            visiblePages={["TrickDetails", "ComboDetails", "PostTrick", "PostCombo"]}
            elseContent={/*<InstallButton />*/ undefined} // TODO: Reinstate installbutton
          >
            <BackButton />
          </Visibility>
        </div>
        <Navbar.Brand href="/" className="me-auto hide-on-desktop">
          Highline Freestyle
        </Navbar.Brand>
        <Navbar.Brand href="/" className="me-auto hide-on-mobile">
          {parentPage}
        </Navbar.Brand>
        <div className="hide-on-desktop nav-item">
          <Settings
            sortOpt={sortingOption}
            setSortOpt={setSortingOption}
            setShowAboutPage={setShowAboutPage}
            setShowResetWarning={setShowResetWarning}
          />
        </div>
      </Container>
    </Navbar>
  );
};

export default TopNav;
