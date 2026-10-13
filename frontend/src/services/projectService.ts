import axios from "axios";
import type {ProjectListItem} from "../interfaces/Project.ts";

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