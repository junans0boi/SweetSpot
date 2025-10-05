import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const webStorage = {
    getItemAsync: async (key) => localStorage.getItem(key),
    setItemAsync: async (key, value) => localStorage.setItem(key, value),
    deleteItemAsync: async (key) => localStorage.removeItem(key),
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTokens = async () => {
            try {
                const accessToken = await webStorage.getItemAsync('accessToken');
                if (accessToken) {
                    setAuthState({
                        accessToken,
                        refreshToken: await webStorage.getItemAsync('refreshToken'),
                        isAuthenticated: true,
                    });
                }
            } catch (e) {
                console.error("토큰 로딩 실패", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadTokens();
    }, []);

    const signIn = async (tokens) => {
        try {
            await webStorage.setItemAsync('accessToken', tokens.accessToken);
            await webStorage.setItemAsync('refreshToken', tokens.refreshToken);
            setAuthState({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                isAuthenticated: true,
            });
        } catch (e) {
            console.error("토큰 저장 실패", e);
        }
    };

    const signOut = async () => {
        try {
            await webStorage.deleteItemAsync('accessToken');
            await webStorage.deleteItemAsync('refreshToken');
            setAuthState({
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
            });
        } catch (e) {
            console.error("토큰 삭제 실패", e);
        }
    };

    return (
        <AuthContext.Provider value={{ authState, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider> // <-- [수정] </Auth.Provider> -> </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};