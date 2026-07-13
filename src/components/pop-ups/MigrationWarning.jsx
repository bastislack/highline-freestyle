import Modal from 'react-bootstrap/Modal';

import Database from "../../services/db";
const db = new Database();

const MigrationWarning = ({ backedUp, setBackedUp, setShowMigrationWarning }) => {
    return (
        <Modal show={true} onHide={() => setShowMigrationWarning(false)} centered>
            <Modal.Header>
                <Modal.Title className="h5">⚠️ Breaking changes coming!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    We are rolling out a brand new version of the Freestyle App with user
                    accounts and more. Your data should be migrated automatically, but
                    things can go wrong.
                </p>
                <p>
                    <strong>Please make sure to save your current progress</strong> so you
                    can import it into the new update in case anything goes wrong with the
                    automatic migration.
                </p>
                <div className="d-grid gap-2 my-3">
                    <button className="btn btn-primary" onClick={() => db.exportDatabase()}>
                        Export my data
                    </button>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="migrationBackedUpCheck"
                        checked={backedUp}
                        onChange={(e) => setBackedUp(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="migrationBackedUpCheck">
                        I backed up my data
                    </label>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => setShowMigrationWarning(false)}>
                    {backedUp ? "Done" : "Remind me later"}
                </button>
            </Modal.Footer>
        </Modal>
    );
}

export default MigrationWarning;
