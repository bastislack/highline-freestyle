import {Navbar, Container} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {pages} from "../../services/enums";
import Visibility from "../containers/Visibility";
import BackButton from "../buttons/BackButton";
import InstallButton from "../buttons/InstallButton";
import {parentPageOf} from "../../services/parentPage";
import Settings from "./Settings";

interface TopNavProps {
  sortOpt: unknown;
  setSortOpt: (sortOpt: unknown) => void;
  setShowAboutPage: (showAboutPage: boolean) => void;
  setShowResetWarning: (showResetWarning: string) => void; // TODO: why is this of type String?
}

const TopNav = ({sortOpt, setSortOpt, setShowAboutPage, setShowResetWarning}: TopNavProps) => {
  const parentPage = parentPageOf(useLocation().pathname.toString().toLowerCase());

  return (
    <Navbar variant="dark" expand="lg" className="top-navigation">
      <Container fluid>
        <div className="navigation-button-container">
          <Visibility
            visiblePages={[pages.TRICKDETAILS, pages.COMBODETAILS, pages.POSTTRICK, pages.POSTCOMBO]}
            elseContent={<InstallButton />}
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
            sortOpt={sortOpt}
            setSortOpt={setSortOpt}
            setShowAboutPage={setShowAboutPage}
            setShowResetWarning={setShowResetWarning}
          />
        </div>
      </Container>
    </Navbar>
  );
};

export default TopNav;
