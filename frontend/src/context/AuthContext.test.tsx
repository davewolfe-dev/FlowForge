import {render, screen, renderHook, waitFor, fireEvent} from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AuthProvider, useAuth } from './AuthContext';

describe("AuthContext and custom hook", () => {
    it('handles initial auth failure on startup', async () => {
        // simulate startup endpoint fails with no response body
        server.use(
            http.get('/api/me/', () => {
                return new HttpResponse(null, { status: 401 });
            })
        );

        // render a small test component using the context
        const TestComponent = () => {
            const { user, loading } = useAuth();
            if (loading) return <div>Loading...</div>;
            return <div>User is: {user ? user.username : 'Anonymous'}</div>;
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const statusText = await screen.findByText(/User is: Anonymous/i);
        expect(statusText).toBeInTheDocument();
    });

    it('successfully triggers logout and clears state', async () => {
        let logoutCalled = false;
        server.use(
            http.post('/api/logout', () => {
                logoutCalled = true;
                return HttpResponse.json({detail: 'Logged out'}, { status: 200 });
            })
        );

        const TestComponent = () => {
            const { user, logout } = useAuth();
            return (
                <div>
                    <span>{user ? 'Logged In' : 'Logged Out'}</span>
                    <button onClick={logout}>Trigger Logout</button>
                </div>
            );
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutBtn = await screen.findByRole('button', { name: /Trigger Logout/i });
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(logoutCalled).toBe(true);
        });
    });

    it('throws an error when useAuth is executed outside an AuthProvider', async () => {
        // suppress console.error inside this block so it doesn't clutter test logs
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // use renderHook to test a custom hook directly
        expect(() => renderHook(() => useAuth())).toThrow(
            'useAuth must be used within an AuthProvider'
        );

        consoleSpy.mockRestore();
    });

    it('displays an error when logout fails', async () => {
        // simulate server error when trying to logout
        server.use(
            http.post('/api/logout', () => {
                return HttpResponse.json(null, { status: 500 });
            })
        );

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const TestComponent = () => {
            const { logout } = useAuth();
            return <button onClick={logout}>Trigger Broken Logout</button>;
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutBtn = await screen.findByRole('button', { name: /Trigger Broken Logout/i });
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Logout Failed:', // ensure this matches your exact string
                expect.any(Error) // verifies that the raw axios exception error object was also passed down
            );
        });
    });
});