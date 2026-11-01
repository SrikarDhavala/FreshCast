import { createContext, useContext, useState, ReactNode } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Update this to your local Wi-Fi IP address!
const AUTH_API_URL = 'http://192.168.1.3:8000/api/auth';

type User = {
    id: string;
    name: string;
    email: string;
    householdSize: number;
    memberSince: string;
};

type AuthContextType = {
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, pass: string) => {
        try {
            // Clean the email: remove accidental spaces and lowercase it
            const cleanEmail = email.trim().toLowerCase();

            const res = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password: pass }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');

            setUser(data);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Error', error.message);
        }
    };

    const signup = async (name: string, email: string, pass: string) => {
        try {
            // Clean the email here too
            const cleanEmail = email.trim().toLowerCase();

            const res = await fetch(`${AUTH_API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: cleanEmail, password: pass }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Signup failed');

            setUser(data);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Signup Error', error.message);
        }
    };

    const logout = () => {
        setUser(null);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}