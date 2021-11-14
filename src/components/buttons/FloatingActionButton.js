import { Link, useLocation } from 'react-router-dom';

const FloatingActionButton = () => {
  // the current Url
  const path = useLocation().pathname.toString().toLowerCase();

  // the url which the button should lead to
  let create;

  if (path === "/") {
    create = "/posttrick"; 
  } else if (path === "/combos") {
    create = "/postcombo";
  } else {
    alert("No path for FAB defined");
  }

  return (
    <Link to={create}>
      <button className="kc_fab_main_btn">
        {"+"}
      </button>
    </Link>
  );
}

export default FloatingActionButton;
