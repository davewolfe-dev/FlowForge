import React from "react";
import {useAuth} from "../context/AuthContext.tsx";
import './Header.css'

import logoImg from '../assets/logo-dark.png'
import {Link} from "react-router";

export default function Header():React.JSX.Element {
    const {user} = useAuth();
    return (
        <header className="site-header">
            <div className="header-container">
                <Link to="/" className="header-logo-link">
                    <img src={logoImg} alt="FlowForge Logo" className="header-logo-img" />
                </Link>
            </div>
            <nav className="header-nav">
                <Link to="/" className="nav-link">Home</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/account" className="nav-link account-badge">{user.username}</Link>
                    </>
                ) : (
                    <>
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-link">Sign Up</Link>
                    </>
                )}
            </nav>
        </header>
    )
}