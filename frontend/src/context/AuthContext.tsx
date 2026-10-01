import React, {createContext, useState, useEffect, useContext, type ReactNode} from "react";
import axios from "axios";

export interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps):React.JSX.Element | null {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function checkAuth(): Promise<void> {
            try {
                const response = await axios.get<User>('/api/me/');
                setUser(response.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, []);

    const login = async (username: string, password: string): Promise<void> => {
        await axios.post('/api/login/', { username, password });

        // After a successful login, instantly hit /api/me/ to get the user data
        const response = await axios.get<User>('/api/me/');
        setUser(response.data); // This triggers a re-render and unlocks ProtectedRoutes!
    };

    const logout = async (): Promise<void> => {
        try {
            await axios.post('/api/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout Failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// custom hook with strong safety guarantees to throw an error if used outside Provider
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};