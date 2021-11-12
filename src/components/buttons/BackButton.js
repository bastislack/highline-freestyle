import { Link, useLocation, useHistory } from 'react-router-dom';
import { BsCaretLeftFill } from 'react-icons/bs';

const BackButton = () => {
  // the current Url
  const path = useLocation().pathname.toString().toLowerCase();

  const history = useHistory();

  const goBack = () => history.go(-1);

  // show button only at specific paths
  var buttonVisible = false
  if (path.includes("/tricks/") || path.includes("/combos/") || path === "/createtrick" || path === "/createcombo") {
    buttonVisible = true
  }

  if (buttonVisible === true) {

    return (
      <button className="btn btn-link" onClick={goBack}>
        <BsCaretLeftFill/>
      </button>
    )
  }

  return (null)

}

export default BackButton;

