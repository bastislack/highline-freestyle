import Modal from "react-bootstrap/Modal";

interface DeleteWarningProps {
  showDeleteWarning: boolean;
  setShowDeleteWarning: (show: boolean) => void;
  itemName: string;
  call: () => void;
}

const DeleteWarning = ({showDeleteWarning, setShowDeleteWarning, itemName, call}: DeleteWarningProps) => {
  return (
    <Modal size="sm" show={showDeleteWarning} onHide={() => setShowDeleteWarning(false)} centered>
      <Modal.Header>
        <Modal.Title className="h6">Delete {itemName}?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row justify-content-around">
            <button className="col-4 btn btn-secondary" onClick={() => setShowDeleteWarning(false)}>
              Cancel
            </button>
            <button
              className="col-4 btn btn-danger"
              onClick={() => {
                call();
                setShowDeleteWarning(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteWarning;
