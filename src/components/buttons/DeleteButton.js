import { BsTrashFill } from 'react-icons/bs';

const DeleteButton = ({call}) => {

  return (
    <button className="btn btn-primary" onClick={call}>
      <BsTrashFill/>
    </button>
  );
}

export default DeleteButton;

