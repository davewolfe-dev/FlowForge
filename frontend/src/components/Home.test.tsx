import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { describe, it, expect, } from "vitest";
import Home from "./Home";

describe("Home page with login and register links", () => {
    it("has a link to the login page", async () => {
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
})