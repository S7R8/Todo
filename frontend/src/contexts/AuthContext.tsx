import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/auth.ts';
import { authApi } from '../lib/auth.ts';

interface AuthContextType {
    user: User | null;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    signup: (userData: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    showLoginPrompt: boolean;
    dismissLoginPrompt: () => void;
    isInitializing: boolean;  // 初期認証チェック中かどうか
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true); // 初期ロード中フラグ
    const [error, setError] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState<boolean>(false);

    // 初期認証チェック
    useEffect(() => {
        const initAuth = async () => {
            setIsInitializing(true);
            const currentPath = window.location.pathname;
            const isDashboard = currentPath === '/dashboard';
            
            if (isDashboard) {
                await checkAuth();
            } else {
                setHasCheckedAuth(true);
            }
            
            // 初期化完了
            setIsInitializing(false);
        };

        initAuth();
    }, []); // 空の依存配列で一度だけ実行

    // セッションがない場合のポップアップを制御（ダッシュボードのみ）
    useEffect(() => {
        // 初期化中は何もしない
        if (isInitializing) return;
        
        if (hasCheckedAuth && !user && !isLoading) {
            const currentPath = window.location.pathname;
            const isDashboard = currentPath === '/dashboard';
            
            if (isDashboard) {
                const timer = setTimeout(() => {
                    setShowLoginPrompt(true);
                }, 1500); // 1.5秒に延長
                return () => clearTimeout(timer);
            }
        }
    }, [hasCheckedAuth, user, isLoading, isInitializing]);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await authApi.checkAuth();
            
            if (response && response.user) {
                setUser(response.user);
                setShowLoginPrompt(false);
            } else if (response && response.todos) {
                // /todosエンドポイントが成功した場合、セッションは有効
                // ユーザー情報がないので、ダミーユーザーをセット
                setUser({ id: 0, name: 'User', email: '' });
                setShowLoginPrompt(false);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            console.error('Auth check failed:', error);
            setUser(null);
            setError(null);
        } finally {
            setIsLoading(false);
            setHasCheckedAuth(true);
        }
    };

    const login = async (credentials: { email: string; password: string }) => {
        try {
            setError(null);
            setIsLoading(true);
            setShowLoginPrompt(false);
            
            const response = await authApi.login(credentials);
            
            if (response && response.user) {
                setUser(response.user);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await checkAuth();
            }
        } catch (error) {
            setError('Login failed. Please check your credentials.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (userData: { name: string; email: string; password: string }) => {
        try {
            setError(null);
            setIsLoading(true);
            await authApi.signup(userData);
        } catch (error) {
            setError('Signup failed. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setError(null);
            setIsLoading(true);
            await authApi.logout();
            setUser(null);
            setShowLoginPrompt(false);
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            setError('Logout failed, but you have been logged out locally.');
        } finally {
            setIsLoading(false);
        }
    };

    const dismissLoginPrompt = () => {
        setShowLoginPrompt(false);
    };

    const value: AuthContextType = {
        user,
        login,
        signup,
        logout,
        checkAuth,
        isLoading,
        error,
        isAuthenticated: !!user,
        showLoginPrompt,
        dismissLoginPrompt,
        isInitializing
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;