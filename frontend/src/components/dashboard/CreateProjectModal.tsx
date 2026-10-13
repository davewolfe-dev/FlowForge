import React, {useState} from "react";
import { createNewProject } from "../../services/projectService.ts";
import type {ProjectListItem} from "../../interfaces/Project.ts";
import './Dashboard.css'

interface CreateProjectModalProps {
    onClose: () => void;
    onProjectCreated: (newProject: ProjectListItem) => void;
}

export default function CreateProjectModal({onClose, onProjectCreated}: CreateProjectModalProps): React.JSX.Element {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // add a new project
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const newProject = await createNewProject(name, description);

            // send newly created project to Dashboard
            onProjectCreated(newProject);
            // hide the overlay
            onClose();
        } catch (error) {
            setError("Could not create project. Verify inputs and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>Create New Project</h3>
                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="modal-p-name">Project Name:</label>
                        <input
                            id="modal-p-name"
                            className="form-control"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="modal-p-desc">Description:</label>
                        <input
                            id="modal-p-desc"
                            className="form-control"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="modal-actions">
                        <button className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}