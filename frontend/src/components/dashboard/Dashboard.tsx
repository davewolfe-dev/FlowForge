import React, {useEffect, useState} from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllProjects} from "../../services/projectService.ts";
import type {ProjectListItem} from "../../interfaces/Project.ts";
import CreateProjectModal from "./CreateProjectModal";
import './Dashboard.css'

export default function Dashboard():React.JSX.Element {
    const {logout} = useAuth();
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleLogoutClick = async () => {
        await logout();
    }

    // download lightweight project list when dashboard loads
    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await fetchAllProjects();
                setProjects(data);
            } catch (err) {
                setError('Failed to download project list');
            }
        }
        void loadProjects();
    }, []);

    const handleNewProjectAdded = (newProject: ProjectListItem) => {
        // insert new project to beginning of projects array
        setProjects((prev:ProjectListItem[]) => [newProject, ...prev]);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Project Dashboard</h1>
                <button className="btn-primary" onClick={()=> setIsModalOpen(true)}>
                    + Create Project
                </button>
                <button className="btn-secondary" onClick={handleLogoutClick}>
                    Logout
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            {projects.length === 0 ? (
                <p>You have no projects. Click the Create Project button above to get started.</p>
            ) : (
                <ul className="project-grid">
                    {projects.map((proj: ProjectListItem) => (
                        <li key={proj.id} className="project-card">
                            <h4>{proj.name}</h4>
                            <p>{proj.description || 'No description provided.'}</p>
                        </li>
                    ))}
                </ul>
            )}

            {isModalOpen && (
                <CreateProjectModal
                    onClose={() => setIsModalOpen(false)}
                    onProjectCreated={handleNewProjectAdded}
                />
            )}
        </div>
    )
}