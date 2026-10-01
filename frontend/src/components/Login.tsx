import React, { useState } from 'react';
import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { useAuth } from "../context/AuthContext.tsx";

// Type definition for Django Rest Framework error response
interface DRFErrorResponse {
    detail?: string;
}

export default function Login(): React.JSX.Element {
    const { login } = useAuth()
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleLogin = async (e:React.SubmitEvent<HTMLFormElement>):Promise<void> => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (error) {
            const err = error as AxiosError<DRFErrorResponse>;
            setError(err.response?.data?.detail || "Incorrect username or password");
        }
    };
    return (
        <div style={{ maxWidth: '300px', margin: '50px auto' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}