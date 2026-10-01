import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';

// mock navigation function to trace routing actions
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
   const actual = await importOriginal<typeof import('react-router')>();
   return {
       ...actual,
       useNavigate: () => mockNavigate,
   }
});

describe('Login component with network mocking', () => {
    it('submits form inputs and navigates to dashboard on successful login', async () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );

        // fill out the input fields
        const usernameInput = await screen.findByTestId('username-field');
        const passwordInput = await screen.findByTestId('password-field')
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // submit the data
        fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

        // wait for mock network handshake to close and verify navigation trigger
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('displays a descriptive error element if server returns 400 error', async () => {
        // override default login handler for this test to simulate failed login attempt
        server.use(
            http.post('/api/login/', () => {
                return HttpResponse.json(
                    {detail: 'Invalid username or password'},
                    {status: 400},
                );
            })
        );

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );

        // fill out the input fields
        const usernameInput = await screen.findByTestId('username-field');
        const passwordInput = await screen.findByTestId('password-field')
        fireEvent.change(usernameInput, { target: { value: 'wrong_user' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong_pass' } });

        // submit the data
        fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

        // verify the error text renders into the view DOM
        const errorText = await screen.findByText('Invalid username or password');
        expect(errorText).toBeInTheDocument();
    });
});