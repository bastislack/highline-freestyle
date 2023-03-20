import {BsTrashFill} from "react-icons/bs";

interface DeleteButtonProps {
  setShowDeleteWarning: (show: boolean) => void;
}

const DeleteButton = ({setShowDeleteWarning}: DeleteButtonProps) => {
  return (
    <button className="btn" onClick={() => setShowDeleteWarning(true)}>
      <BsTrashFill />
    </button>
  );
};

export default DeleteButton;
