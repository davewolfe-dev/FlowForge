import type {ReactNode} from "react";
import React from "react";

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export interface AuthProviderProps {
    children: ReactNode;
}