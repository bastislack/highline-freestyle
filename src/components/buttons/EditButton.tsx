import {BsPencilFill} from "react-icons/bs";

interface EditButtonProps {
  call: () => void;
}

const EditButton = ({call}: EditButtonProps) => {
  return (
    <button className="btn" onClick={call}>
      <BsPencilFill />
    </button>
  );
};

export default EditButton;
