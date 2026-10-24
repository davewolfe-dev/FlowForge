import axios from "axios";
import type {DocumentPayload, ProjectItem, ProjectListItem, ProjectResponse} from "../interfaces/Project.ts";

/**
 * Sends a POST request to server to create a new project record
 * @param name The project name.
 * @param description A brief description of the project
 */
export async function createNewProject(name:string, description:string): Promise<ProjectListItem> {
    const response = await axios.post('/api/projects/', {
        name: name,
        description: description,
    });
    return response.data;
}

/**
 * Fetches array lightweight project data for the user's dashboard.
 */
export async function fetchAllProjects(): Promise<ProjectListItem[]> {
    const response = await axios.get('/api/projects/');
    return response.data;
}

/**
 * Fetches a single project that includes the heavy document data
 * @param id The id of the project to fetch
 */
export async function fetchProject(id: number): Promise<ProjectItem> {
    const response = await axios.get(`/api/projects/${id}/`);
    return response.data;
}

export async function updateProject(projectId: number, projectPayload: DocumentPayload): Promise<ProjectResponse>{
    return await axios.put(`/api/projects/${projectId}/document`, projectPayload);
}
