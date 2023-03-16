import Modal from "react-bootstrap/Modal";

const DeleteWarning = ({showDeleteWarning, setShowDeleteWarning, itemName, call}) => {
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
