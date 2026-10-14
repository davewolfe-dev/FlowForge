import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from "../../context/AuthContext";
import Dashboard from './Dashboard';
import type {ProjectListItem} from "../../interfaces/Project.ts";
import {createNewProject, fetchAllProjects} from "../../services/projectService.ts";

// mock the hook structure
vi.mock('../../context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof AuthProvider>();
    return {
        ...actual,
        useAuth: vi.fn(),
    }
})

// mock navigation function to trace routing actions
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
});

// mock the network services layer to avoid crashing on context loads
vi.mock('../../services/projectService', () => ({
    fetchAllProjects: vi.fn().mockResolvedValue([]), // Return empty array state on startup
    createNewProject: vi.fn(),
}));

describe("Dashboard component project list, create project and logout functions", () => {
    it("downloads and displays the project list from the service layer on mount", async () => {
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: vi.fn()
        });

        const mockProjectsList: ProjectListItem[] = [
            {
                id: 1,
                name: 'FlowForge Core Engine',
                description: 'Building out strict same-origin architectures.',
                owner: 'bill',
                created_at: '2026-10-13T12:00:00Z',
                updated_at: '2026-10-13T12:00:00Z',
            },
            {
                id: 2,
                name: 'Vite Component Engine',
                description: '', // Testing empty description fallbacks
                owner: 'bill',
                created_at: '2026-10-13T13:00:00Z',
                updated_at: '2026-10-13T13:00:00Z',
            },
        ];

        // return this array specifically for this test run
        vi.mocked(fetchAllProjects).mockResolvedValueOnce(mockProjectsList);

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const firstProjectHeading = await screen.findByRole('heading', { name: /FlowForge Core Engine/i });
        const firstProjectDesc = await screen.findByText(/Building out strict same-origin architectures/i);
        const secondProjectHeading = await screen.findByRole('heading', { name: /Vite Component Engine/i });
        const secondProjectDesc = await screen.findByText(/No description provided/i); // Checks your string placeholder fallback logic

        expect(firstProjectHeading).toBeInTheDocument();
        expect(firstProjectDesc).toBeInTheDocument();
        expect(secondProjectHeading).toBeInTheDocument();
        expect(secondProjectDesc).toBeInTheDocument();

        // verify the "no projects found" banner is hidden when data is present
        expect(screen.queryByTestId("no-projects")).not.toBeInTheDocument();
    });

    it("prompts user to create a new project if no projects are found", async () => {
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: vi.fn()
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const noProjects = await screen.findByTestId('no-projects');
        expect(noProjects).toBeInTheDocument();
    });

    it("displays an error message if project list could not be downloaded", async () => {
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: vi.fn()
        });

        // mock network error
        vi.mocked(fetchAllProjects).mockRejectedValueOnce(new Error('Network Crash'));

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const errorMessage = await screen.findByText(/Failed to download project list/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it("toggles the CreateProjectModal overlay open and closed based on button clicks", async () => {
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: vi.fn()
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        // verify initial state does not show the modal
        const createProjectHeading = screen.queryByRole('heading', { name: /Create New Project/i });
        expect(createProjectHeading).not.toBeInTheDocument();

        // click the create project button and verify modal is present
        const openModalBtn = await screen.findByRole('button', { name: /\+ Create Project/i });
        fireEvent.click(openModalBtn);

        const modalHeading = await screen.findByRole('heading', { name: /Create New Project/i });
        expect(modalHeading).toBeInTheDocument();

        // verify cancel button closes the modal
        const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /Create New Project/i })).not.toBeInTheDocument();
        });
    });

    it('opens the modal, submits fields, and adds new project to the view', async () => {
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: vi.fn()
        });

        // mock object that the backend should return on success
        const mockNewProject: ProjectListItem = {
            id: 50,
            name: 'Alpha Node Engine',
            description: 'Built via modal overlay components.',
            owner: 'bill',
            created_at: '2026-10-13T14:00:00Z',
            updated_at: '2026-10-13T14:00:00Z',
        };
        vi.mocked(createNewProject).mockResolvedValueOnce(mockNewProject);

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        // open the modal overlay and fill out form
        const openModalBtn = await screen.findByRole('button', { name: /\+ Create Project/i });
        fireEvent.click(openModalBtn);

        const nameInput = await screen.findByLabelText(/Project Name:/i);
        const descInput = await screen.findByLabelText(/Description:/i);
        const submitBtn = await screen.findByTestId("create-btn");

        fireEvent.change(nameInput, { target: { value: 'Alpha Node Engine' } });
        fireEvent.change(descInput, { target: { value: 'Built via modal overlay components.' } });

        // submit the form
        fireEvent.click(submitBtn);

        // the modal overlay should unmount and disappear automatically
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /Create New Project/i })).not.toBeInTheDocument();
        });

        // the dashboard instantly runs handleNewProjectAdded and renders the new card
        const updatedProjectHeading = await screen.findByRole('heading', { name: /Alpha Node Engine/i });
        const updatedProjectDesc = await screen.findByText(/Built via modal overlay components\./i);

        expect(updatedProjectHeading).toBeInTheDocument();
        expect(updatedProjectDesc).toBeInTheDocument();

        // Verify the "No projects found" banner has now hidden itself
        expect(screen.queryByTestId("no-projects")).not.toBeInTheDocument();
    });

    it('should display an error message if new project failed to be created', async () => {
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: vi.fn()
        });
        vi.mocked(createNewProject).mockRejectedValueOnce(new Error('Failed to create project'));

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        // open the modal overlay and fill out form
        const openModalBtn = await screen.findByRole('button', { name: /\+ Create Project/i });
        fireEvent.click(openModalBtn);

        const nameInput = await screen.findByLabelText(/Project Name:/i);
        const descInput = await screen.findByLabelText(/Description:/i);
        const submitBtn = await screen.findByTestId("create-btn");

        fireEvent.change(nameInput, { target: { value: 'Alpha Node Engine' } });
        fireEvent.change(descInput, { target: { value: 'Built via modal overlay components.' } });

        // submit the form
        fireEvent.click(submitBtn);

        const errorMsg = await screen.findByTestId("error-msg");
        expect(errorMsg).toBeInTheDocument();
    });

    it('should logout the user', async () => {
        // create a tracking reference for the logout function
        const mockLogout = vi.fn().mockResolvedValue(undefined);
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            user: { id: 1, username: 'test_user', email: 'test_email@example.com' },
            logout: mockLogout,
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        // test logout function
        const logoutButton = await screen.findByRole('button', { name: /Logout/i });
        fireEvent.click(logoutButton);

        // wait for mock network handshake to close and verify navigation trigger
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
        });
    });
});