import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import {describe, it, expect, type Mock,} from "vitest";
import Home from "./Home";
import { useAuth } from "../context/AuthContext";

// mock the hook structure
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

describe("Home page with login and register links", () => {
    it("has a link to the login page", async () => {
        // simulate anonymous user environment (user is null)
        (useAuth as Mock).mockReturnValue({user: null});

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<div>Public Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const loginLink = await screen.findByTestId('login-link');
        fireEvent.click(loginLink);

        await waitFor(() => {
            expect(screen.getByText('Public Login Page')).toBeInTheDocument();
        });
    });

    it("has a link to the register page", async () => {
        (useAuth as Mock).mockReturnValue({user: null});

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<div>Public Registration Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const registerLink = await screen.findByTestId('register-link');
        fireEvent.click(registerLink);

        await waitFor(() => {
            expect(screen.getByText('Public Registration Page')).toBeInTheDocument();
        });
    });

    it("has a link to the dashboard if user is logged in", async () => {
        (useAuth as Mock).mockReturnValue({user: {username: 'John'}});

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        const dashboardLink = await screen.findByTestId('dashboard-link');
        fireEvent.click(dashboardLink);

        await waitFor(() => {
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
        });
    });
})