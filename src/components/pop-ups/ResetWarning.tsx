import Modal from "react-bootstrap/Modal";
import {RootContextData} from "../../routes/root";

import Database from "../../services/db";
const db = new Database();

interface ResetWarningProps {
  rootContext: RootContextData;
}

const ResetWarning = (props: ResetWarningProps) => {
  const {showResetWarning, setShowResetWarning} = props.rootContext;

  const reset = () => {
    if (showResetWarning === "tricks") {
      db.dropUserTricks();
    } else if (showResetWarning === "combos") {
      db.dropUserCombos();
    }
  };

  return (
    <Modal size="sm" show={showResetWarning} onHide={() => setShowResetWarning(false)} centered>
      <Modal.Header>
        <Modal.Title className="h6">Reset {showResetWarning}?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <ul>
            <li>All predefined {showResetWarning} are restored</li>
            <li>Stick frequencies are set to 'Never tried'</li>
            <li>Your added {showResetWarning} are deleted!</li>
          </ul>
        </div>
        <div className="container">
          <div className="row justify-content-around">
            <button className="col-4 btn btn-secondary" onClick={() => setShowResetWarning(false)}>
              Cancel
            </button>
            <button
              className="col-4 btn btn-danger"
              onClick={() => {
                reset();
                setShowResetWarning(false);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ResetWarning;
