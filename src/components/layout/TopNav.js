import { Nav, Navbar, Dropdown, Container } from "react-bootstrap";
import { BsGearFill } from 'react-icons/bs';
import { useLocation } from "react-router-dom";
import { links } from "../../links";

const TopNav = ({ children }) => {
  const path = useLocation().pathname.toString().toLowerCase();

  return <Navbar bg="dark" variant="dark" expand="lg" className="top-navigation">
    <Container fluid>
      <Navbar.Brand href="/" className="">Highline Freestyle</Navbar.Brand>
      <div className="nav-item">
        { children }
      </div>
    </Container>
  </Navbar>;
}

export default TopNav;
