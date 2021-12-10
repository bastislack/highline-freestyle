import { Link, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { links } from "../../links";

const BottomNav = () => {
  const path = useLocation().pathname.toString().toLowerCase();

  return (
    <Nav fill variant="pills" className="hide-on-desktop bottom-navigation">
      {
        links.map((link) => {
          return <Nav.Item key={link.url}>
            <Nav.Link href={link.url} className={(link.isActive(path) ? "active" : "text-white")}>{link.name}</Nav.Link>
          </Nav.Item>;
        })
      }
    </Nav>
  );
}

export default BottomNav;
