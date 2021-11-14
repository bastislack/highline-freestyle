import { useLocation, useHistory } from 'react-router-dom';
import { BsCaretLeftFill } from 'react-icons/bs';

const BackButton = () => {

  const history = useHistory();

  const goBack = () => history.go(-1);

  return (
    <button className="btn btn-link" onClick={goBack}>
      <BsCaretLeftFill/>
    </button>
  );
}

export default BackButton;

