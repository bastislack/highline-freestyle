import { Link, useLocation } from 'react-router-dom';
import { Fab } from '@material-ui/core';

const FloatingActionButton = ({ setTrickListScrollPosition, setComboListScrollPosition, setUserCombo }) => {
  // the current Url
  const path = useLocation().pathname.toString().toLowerCase();

  // the url which the button should lead to
  let create;
  if (path === "/") {
    create = "/posttrick";
  } else if (path === "/combos") {
    create = "/postcombo";
  } else {
    console.log("No path for FAB defined");
  }

  const updateScrollPosition = () => {
    if (path === "/") {
      setTrickListScrollPosition(window.scrollY);
    } else if (path === "/combos") {
      setComboListScrollPosition(window.scrollY);
      setUserCombo(null);
    }
  }

  return (
    <Link to={create} className="fab_button">
      <Fab size="medium" onClick={updateScrollPosition} color="secondary" aria-label="add">
        <i className="bi bi-plus-lg"></i>
      </Fab>
    </Link>
  );
}

export default FloatingActionButton;
