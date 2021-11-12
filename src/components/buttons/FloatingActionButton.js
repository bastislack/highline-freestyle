import { Link, useLocation } from 'react-router-dom';

const FloatingActionButton = () => {
  // the current Url
  const path = useLocation().pathname.toString().toLowerCase();

  // show button only at specific paths
  var buttonVisible = false
  if (path === "/" || path === "/combos") {
    buttonVisible = true
  }

  if (buttonVisible === true) {
    // definie hiere to where the button leads, depending on the current path
    let create = path;
    if (path === "/") {
      create = "/createtrick";
    } else if (path === "/combos") {
      create = "/createcombo";
    } else {
      console.log("no path for the FloatingActionButton has been defined");
    }

    return (
      <Link to={create}>
        <button className="kc_fab_main_btn">
          {"+"}
        </button>
      </Link>
    )
  }

  return (null)

}

export default FloatingActionButton;
