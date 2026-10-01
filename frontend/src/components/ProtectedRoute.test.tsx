import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { describe, it, expect, vi, type Mock } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// mock the hook structure
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

describe("ProtectedRoute Component Gatekeeper", () => {
    it("redirected unauthenticated user directly to the login screen", () => {
        // simulate anonymous user environment (user is null)
        (useAuth as Mock).mockReturnValue({user: null});

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Secret Dashboard Content</div>} />
                    </Route>
                    <Route path="/login" element={<div>Public Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        // The user should be securely bumped off the dashboard and sent to the login screen
        expect(screen.getByText('Public Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Secret Dashboard Content')).not.toBeInTheDocument();
    });

    it("renders the child route component if user session is valid", () => {
       // simulate an authenticated user environment
        (useAuth as Mock).mockReturnValue({ user: { id: 1, username: 'test_user' } });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Secret Dashboard Content</div>} />
                    </Route>
                    <Route path="/login" element={<div>Public Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        // The user has active clearance; render the content instantly
        expect(screen.getByText('Secret Dashboard Content')).toBeInTheDocument();
    });
})