import { BsTrashFill } from 'react-icons/bs';

const DeleteButton = ({call}) => {

  return (
    <button className="btn" onClick={call}>
      <BsTrashFill/>
    </button>
  );
}

export default DeleteButton;

