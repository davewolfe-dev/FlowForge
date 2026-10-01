import '@testing-library/jest-dom/vitest'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { server } from "./mocks/server.ts";

// start interception worker pool before test suite runs
beforeAll(() => server.listen({onUnhandledRequest: 'error'}));

// clear out custom runtime route modifiers between individual tests
afterEach(() => server.resetHandlers());

// close server pool when test execution is complete
afterAll(() => server.close());