// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from "./components/dashboard/Dashboard";
import Register from "./components/Register";
import Home from "./components/Home";
import Header from "./components/Header";
import ProjectEditor from "./components/editor/ProjectEditor.tsx";
import NotFound from "./components/NotFound.tsx";

function App(): React.JSX.Element {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/project/:id/edit" element={<ProjectEditor />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
