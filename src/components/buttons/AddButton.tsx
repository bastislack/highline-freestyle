interface AddButtonProps {
  call: () => void;
}

const AddButton = ({call}: AddButtonProps) => {
  return (
    <button className="btn btn-primary" onClick={call}>
      +
    </button>
  );
};

export default AddButton;
