import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard():React.JSX.Element {
    const {user, logout} = useAuth();

    const handleLogoutClick = async () => {
        await logout();
    }

    return (
        <div style={{ padding: '20px'}}>
            <h1>Welcome to the Protected Dashboard, {user?.username}!</h1>
            <p>Your email is configured as: {user?.email}</p>

            <button onClick={handleLogoutClick} style={{ marginTop: '20px', padding: '8px 16px' }}>Logout Securely</button>
        </div>
    )
}