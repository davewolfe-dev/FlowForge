import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import App from './App';

describe('App Component', () => {
    it('Renders the public Home page by default', async () => {
        // force browser history simulation to start at root / path
        window.history.pushState({}, 'Test Home', '/');

        render(<App />);

        const homeHeading = await screen.findByRole('heading', { name: /FlowForge/i });
        expect(homeHeading).toBeInTheDocument();
    });

    it('Redirects to the login page if an unauthenticated user attempts to view /dashboard', async () => {
        // simulate unauthenticated api call
        server.use(
            http.get('/api/me/', () => {
                return new HttpResponse(null, { status: 403 });
            })
        );

        // force the window location simulation to start at a protected sub-page
        window.history.pushState({}, 'Test Dashboard Direct Link', '/dashboard');

        render(<App />);

        const loginHeading = await screen.findByRole('heading', { name: /Login/i });
        expect(loginHeading).toBeInTheDocument();

        expect(screen.queryByText(/Welcome to the Protected Dashboard/i)).not.toBeInTheDocument();
    });

    it('renders to 404 page when navigating to invalid URL', async () => {
        // frce the virtual browser history to start at an arbitrary invalid route
        window.history.pushState({}, 'Test 404 Page', '/this-path-is-fake');

        render(<App />);

        const notFoundHeading = await screen.findByRole('heading', { name: /404 Page Not Found/i });
        expect(notFoundHeading).toBeInTheDocument();
    });
});