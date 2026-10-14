import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { fetchAllProjects, createNewProject } from './projectService';

describe('ProjectService API', () => {
    it('resolves fetchAllProjects with array of projects', async () => {
        const projects = await fetchAllProjects();

        expect(Array.isArray(projects)).toBe(true);
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Service Project One');
        expect(projects[0].owner).toBe('bill');
    });

    it('transmits parameters to createNewProject and resolves with a 201 created project object payload', async () => {
        const newProject = await createNewProject('Beta Analytics Platform', 'Tracking telemetry pipelines.');

        expect(newProject).toHaveProperty('id');
        expect(newProject.id).toBe(2);
        expect(newProject.name).toBe('Beta Analytics Platform');
        expect(newProject.description).toBe('Tracking telemetry pipelines.');
    });

    it('correctly propagates an Axios mapping exception error if the server crashes with a 500', async () => {
        // override the get endpoint for this test to trigger an api error condition
        server.use(
            http.get('/api/projects/', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        await expect(fetchAllProjects()).rejects.toThrow();
    });
})