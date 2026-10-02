import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from "../context/AuthContext";
import Dashboard from './Dashboard';

// mock the hook structure
vi.mock('../context/AuthContext', async (importOriginal) => {
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

describe("Dashboard component with welcome message and logout function", () => {
    it('should display a message with the username and email address', async () => {
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

        // use regex to find username and email address instead of exact string, because elements contain more than just the username and password
        const username = await screen.findByText(/test_user/i)
        const email = await screen.findByText(/test_email@example.com/i)
        expect(username).toBeInTheDocument();
        expect(email).toBeInTheDocument();
    });
    it('should logout the user and redirect to login page', async () => {
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
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
});