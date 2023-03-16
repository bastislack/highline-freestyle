import {useLocation} from "react-router-dom";
import {Nav} from "react-bootstrap";
import {links} from "../../links";
import {Link} from "react-router-dom";

const BottomNav = () => {
  const path = useLocation().pathname.toString().toLowerCase();

  return (
    <Nav fill variant="pills" className="hide-on-desktop bottom-navigation">
      {links.map((link) => {
        return (
          <Nav.Item key={link.url}>
            <Link
              to={link.url}
              className={
                link.isActive(path) ? "nav-link active" : "nav-link text-white"
              }
            >
              {link.name}
            </Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default BottomNav;
