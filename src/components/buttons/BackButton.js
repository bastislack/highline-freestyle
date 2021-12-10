import { useLocation, useNavigate } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';

const BackButton = () => {

  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <button className="btn btn-link back-button" onClick={goBack}>
      <BiArrowBack className="react-icon-light" />
    </button>
  );
}

export default BackButton;

