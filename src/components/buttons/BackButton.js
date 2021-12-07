import { useLocation, useNavigate } from 'react-router-dom';
import { BsCaretLeftFill } from 'react-icons/bs';

const BackButton = () => {

  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <button className="btn btn-link" onClick={goBack}>
      <BsCaretLeftFill/>
    </button>
  );
}

export default BackButton;

