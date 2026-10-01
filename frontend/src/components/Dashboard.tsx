import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router';

export default function Dashboard():React.JSX.Element {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogoutClick = async () => {
        await logout();
        navigate('/login');
    }

    return (
        <div style={{ padding: '20px'}}>
            <h1>Welcome to the Protected Dashboard, {user?.username}!</h1>
            <p>Your email is configured as: {user?.email}</p>

            <button onClick={handleLogoutClick} style={{ marginTop: '20px', padding: '8px 16px' }}>Logout Securely</button>
        </div>
    )
}