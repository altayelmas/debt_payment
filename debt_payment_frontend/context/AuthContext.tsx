'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    email: string;
    nameid: string;
    exp: number;
}

interface AuthContextType {
    token: string | null;
    userEmail: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

interface AuthState {
    token: string | null;
    email: string | null;
}

function getInitialAuthState(): AuthState {
    if (typeof window === 'undefined') {
        return { token: null, email: null };
    }

    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
        try {
            const decoded: DecodedToken = jwtDecode(storedToken);

            if (decoded.exp * 1000 > Date.now()) {
                return { token: storedToken, email: decoded.email };
            } else {
                localStorage.removeItem('authToken');
                return { token: null, email: null };
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('authToken');
            return { token: null, email: null };
        }
    }
    return { token: null, email: null };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

    const login = (newToken: string) => {
        try {
            const decoded: DecodedToken = jwtDecode(newToken);
            localStorage.setItem('authToken', newToken);
            setAuthState({ token: newToken, email: decoded.email });
        } catch (error) {
            console.error("Couldn't decode token:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthState({ token: null, email: null });
    };

    const isAuthenticated = !!authState.token;

    return (
        <AuthContext.Provider
            value={{
                token: authState.token,
                userEmail: authState.email,
                login,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth should be used in AuthProvider');
    }
    return context;
}