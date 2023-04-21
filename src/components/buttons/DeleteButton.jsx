import { BsTrashFill } from 'react-icons/bs';

const DeleteButton = ({ setShowDeleteWarning }) => {
  return (
    <button className="btn" onClick={() => setShowDeleteWarning(true)}>
      <BsTrashFill/>
    </button>
  );
}

export default DeleteButton;
