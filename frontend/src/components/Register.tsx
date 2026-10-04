import React, { useState } from 'react';
import axios, { type AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { useAuth } from "../context/AuthContext.tsx";
import type {User} from "../interfaces/Auth.ts";

interface RegistrationErrors {
    username?: string[];
    password?: string[];
    email?: string[];
    detail?: string;
}

export default function Register():React.JSX.Element {
    const { setUser } = useAuth()
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [first_name, setFirstName] = useState<string>('');
    const [last_name, setLastName] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<RegistrationErrors>({});
    const navigate = useNavigate();

    const handleRegister = async (e:React.SubmitEvent<HTMLFormElement>):Promise<void> => {
        e.preventDefault();
        setFieldErrors({})

        try {
            const response = await axios.post<User>('/api/register/', { username, password, email, first_name, last_name });
            setUser(response.data);
            navigate('/dashboard');
        } catch (exception) {
            const err = exception as AxiosError<RegistrationErrors>;
            if (err.response && err.response.data) {
                setFieldErrors(err.response.data);
            } else {
                setFieldErrors({detail: "An unexpected error occurred."})
            }
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto' }}>
            <h2>Register</h2>
            {/* global error fallback check */}
            {fieldErrors.detail && <p style={{ color: 'red' }}>{fieldErrors.detail}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label htmlFor="username-input">Username:</label>
                    <input
                        id="username-input"
                        data-testid="username-field"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required />
                    {fieldErrors.username && (
                        <p style={{ color: 'red', margin: '5px 0 0', fontSize: '12px' }}>
                            {fieldErrors.username.join(' ')}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="password-input">Password:</label>
                    <input
                        id="password-input"
                        data-testid="password-field"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required />
                    {fieldErrors.password && (
                        <p style={{ color: 'red', margin: '5px 0 0', fontSize: '12px' }}>
                            {fieldErrors.password.join(' ')}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="email-input">Email:</label>
                    <input
                        id="email-input"
                        data-testid="email-field"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required />
                    {fieldErrors.email && (
                        <p style={{ color: 'red', margin: '5px 0 0', fontSize: '12px' }}>
                            {fieldErrors.email.join(' ')}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="fname-input">First Name:</label>
                    <input
                        id="fname-input"
                        data-testid="fname-field"
                        type="text"
                        value={first_name}
                        onChange={e => setFirstName(e.target.value)}
                        />
                </div>
                <div>
                    <label htmlFor="lname-input">Last Name:</label>
                    <input
                        id="lname-input"
                        data-testid="lname-field"
                        type="text"
                        value={last_name}
                        onChange={e => setLastName(e.target.value)}
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}