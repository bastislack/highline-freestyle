import { Nav, Navbar, Dropdown, Container } from "react-bootstrap";
import { BsGearFill } from 'react-icons/bs';
import { useLocation } from "react-router-dom";
import { links } from "../../links";
import { pages } from '../../services/enums';
import Visibility from '../../components/containers/Visibility';
import BackButton from "../../components/buttons/BackButton";
import InstallButton from "../../components/buttons/InstallButton";
import { parentPageOf, parentPageMatches } from '../../services/parentPage';
import Settings from '../../components/layout/Settings';

const TopNav = ({ sortOpt, setSortOpt, setShowAboutPage }) => {
  const parentPage = parentPageOf(useLocation().pathname.toString().toLowerCase());

  return <Navbar variant="dark" expand="lg" className="top-navigation">
    <Container fluid>
      <div className="navigation-button-container">
        <Visibility visiblePages={[pages.TRICKDETAILS, pages.COMBODETAILS, pages.POSTTRICK, pages.POSTCOMBO]} elseContent={<InstallButton/>}>
          <BackButton/>
        </Visibility>
      </div>
      <Navbar.Brand href="/" className="me-auto hide-on-desktop">Highline Freestyle</Navbar.Brand>
      <Navbar.Brand href="/" className="me-auto hide-on-mobile">{ parentPage }</Navbar.Brand>
      <div className="hide-on-desktop nav-item">
        <Settings
          sortOpt={sortOpt}
          setSortOpt={setSortOpt}
          setShowAboutPage={setShowAboutPage} />
      </div>
    </Container>
  </Navbar>;
}

export default TopNav;
