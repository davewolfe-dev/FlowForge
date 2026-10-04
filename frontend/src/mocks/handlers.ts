import { http, HttpResponse } from "msw";

export const handlers = [
    // mock /api/me/ (success state)
    http.get('/api/me/', () => {
        return HttpResponse.json({
            id: 1,
            username: "mock_user",
            email: "mock@example.com",
            is_admin: false,
            first_name: "Mock",
            last_name: "User",
        }, { status: 200 });
    }),

    // mock /api/login/ (success state)
    http.post('/api/login/', () => {
        return HttpResponse.json({
            detail: "Successfully logged in",
        }, { status: 200 });
    }),

    // mock /api/register/ (success state)
    http.post('/api/register/', () => {
        return HttpResponse.json({
            id: 101,
            username: "testuser",
            email: "test@test.com",
            first_name: "Test",
            last_name: "User",
            is_admin: false,
        }, { status: 201 });
    }),
]