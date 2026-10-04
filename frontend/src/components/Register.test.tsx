import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import {describe, it, expect, vi, type Mock} from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Register from './Register';

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

describe('Register component for new user signup', () => {
    it('Submits new user data and redirects to the dashboard', async ():Promise<void> => {
        // create a tracking reference for the logout function
        const mockSetUser = vi.fn().mockResolvedValue(undefined);
        // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({
            setUser: mockSetUser,
        });
        render(
            <AuthProvider>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthProvider>
        );

        // fill out the input fields
        const usernameInput = await screen.findByTestId('username-field');
        const passwordInput = await screen.findByTestId('password-field');
        const emailInput = await screen.findByTestId('email-field');
        const fnameInput = await screen.findByTestId('fname-field');
        const lnameInput = await screen.findByTestId('lname-field');
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(fnameInput, { target: { value: 'Test' } });
        fireEvent.change(lnameInput, { target: { value: 'User' } });

        // submit the data
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(mockSetUser).toHaveBeenCalledExactlyOnceWith({
                id: 101,
                    username: "testuser",
                    email: "test@test.com",
                    first_name: "Test",
                    last_name: "User",
                    is_admin: false,
            })
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('Displays error messages when user registration fails', async () => {
        const usernameErrorMsg = "A user with that username already exists.";
        const emailErrorMsg = "A user with that email already exists.";
        const passwordErrorMsg = "Invalid password.";
        // override default register handler for this test to simulate failed registration attempt
        server.use(
            http.post('/api/register/', () => {
                return HttpResponse.json(
                    {
                        username: [usernameErrorMsg],
                        email: [emailErrorMsg],
                        password: [passwordErrorMsg],
                    },
                    {status: 400},
                );
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthProvider>
        );

        // fill out the input fields
        const usernameInput = await screen.findByTestId('username-field');
        const passwordInput = await screen.findByTestId('password-field');
        const emailInput = await screen.findByTestId('email-field');
        fireEvent.change(usernameInput, { target: { value: 'duplicate_username' } });
        fireEvent.change(passwordInput, { target: { value: 'invalid_password' } });
        fireEvent.change(emailInput, { target: { value: 'duplicate_email@test.com' } });

        // submit the data
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        // verify the error text renders into the view DOM
        const usernameErrorText = await screen.findByText(usernameErrorMsg);
        const passwordErrorText = await screen.findByText(passwordErrorMsg);
        const emailErrorText = await screen.findByText(emailErrorMsg);
        expect(usernameErrorText).toBeInTheDocument();
        expect(passwordErrorText).toBeInTheDocument();
        expect(emailErrorText).toBeInTheDocument();
    });
});