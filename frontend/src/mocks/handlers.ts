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

    // mock /api/projects/
    http.get('/api/projects/', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: 'Service Project One',
                owner: 'bill',
                description: 'Testing service layers.',
                created_at: '2026-10-13T12:00:00Z',
                updated_at: '2026-10-13T12:00:00Z',
            }
        ], { status: 200 });
    }),
    http.post('/api/projects/', async ({request}) => {
        const body = (await request.json()) as { name: string; description: string };
        return HttpResponse.json({
            id: 2,
            name: body.name,
            owner: 'bill',
            description: body.description,
            created_at: '2026-10-13T15:00:00Z',
            updated_at: '2026-10-13T15:00:00Z',
        }, { status: 201 });
    }),

    // mock /api/projects/<pk>/
    http.get('/api/projects/1/', () => {
        return HttpResponse.json(
            {
                id: 1,
                name: 'Service Project One',
                owner: 'bill',
                description: 'Testing service layers.',
                document: {},
                created_at: '2026-10-13T12:00:00Z',
                updated_at: '2026-10-13T12:00:00Z',
            }, { status: 200 });
    }),
]