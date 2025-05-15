// context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
    id: string;
    email: string;
    userName: string;
    userType: string;
    userStatus: string;
};

interface AuthContextType {
    user: User | null;
    hasSession: boolean;
    loading: boolean;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hasSession, setHasSession] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/validate-session', { credentials: 'include' });
            const data = await res.json();
            setUser(data.isValid ? data.user : null);
            setHasSession(data.isValid);
        } catch {
            setUser(null);
            setHasSession(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, hasSession, loading, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
