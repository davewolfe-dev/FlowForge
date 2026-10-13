import React from "react";
import {Link} from "react-router";
import {useAuth} from "../context/AuthContext.tsx";

export default function Home(): React.JSX.Element {
    const { user } = useAuth();
    return (
        <div>
            <h1>FlowForge</h1>
            <h3>The Interactive Experience Planner</h3>
            { user == null ? (
                <div>
                    <p><Link data-testid="login-link" to="/login">Login</Link></p>
                    <p><Link data-testid="register-link" to="/register">Register</Link></p>
                </div>
            ) : (
                <div>
                    <p>Welcome back {user.username}!</p>
                    <Link data-testid="dashboard-link" to="/dashboard">View Project Dashboard</Link>
                </div>
            )}
        </div>
    )
}