// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from "./components/Dashboard.tsx";

// Inline simple definitions to ensure it works instantly
const Home = (): React.JSX.Element => <h1>React Home Page</h1>;
const NotFound = (): React.JSX.Element => <h1>404 Page Not Found</h1>;

function App(): React.JSX.Element {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
