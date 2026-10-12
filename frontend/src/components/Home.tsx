import React from "react";
import {Link} from "react-router";

export default function Home(): React.JSX.Element{
    return (
        <div>
            <h1>FlowForge</h1>
            <h3>The Interactive Experience Planner</h3>
            <p><Link data-testid="login-link" to="/login">Login</Link></p>
            <p><Link data-testid="register-link" to="/register">Register</Link></p>
        </div>
    )
}