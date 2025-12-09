import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await fetch('/api/auth/user', {
                credentials: 'include',
            });
            if (res.ok) {
                return res.json();
            }
            return null;
        },
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async ({ username, password }: { username: string; password: string }) => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Login failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: async ({ username, password, email }: { username: string; password: string; email?: string }) => {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email }),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Registration failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Logout failed');
            }
        },
        onSuccess: () => {
            queryClient.clear(); // Clear all queries to prevent data leaking to new login
            queryClient.setQueryData(['user'], null);
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: { name?: string; email?: string; password?: string }) => {
            const res = await fetch('/api/auth/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Update failed');
            }
            return res.json();
        },
        onSuccess: (user) => {
            queryClient.setQueryData(['user'], user);
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/auth/user', {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Delete failed');
            }
        },
        onSuccess: () => {
            queryClient.clear(); // Clear all data
            queryClient.setQueryData(['user'], null);
        },
    });

    const login = async (username: string, password: string) => {
        await loginMutation.mutateAsync({ username, password });
    };

    const register = async (username: string, password: string, email?: string) => {
        await registerMutation.mutateAsync({ username, password, email });
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
        await updateProfileMutation.mutateAsync(data);
    };

    const deleteAccount = async () => {
        await deleteAccountMutation.mutateAsync();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, deleteAccount }}>
            {children}
        </AuthContext.Provider >
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
