import { BsPencilFill } from 'react-icons/bs';

const EditButton = ({call}) => {

  return (
    <button className="btn" onClick={call}>
      <BsPencilFill/>
    </button>
  );
}

export default EditButton;
