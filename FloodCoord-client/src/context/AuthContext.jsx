import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Decode token and extract user info including role
    const decodeToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Extract role from decoded token - handles your backend JWT structure
    const extractRole = (decoded) => {
        if (!decoded) return 'CITIZEN';
        
        // Your backend stores role in 'roles' array
        if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
            return decoded.roles[0];
        }
        
        // Fallback options
        if (decoded.role) return decoded.role;
        if (decoded.authority) return decoded.authority;
        
        return 'CITIZEN';
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        
        if (accessToken) {
            const decoded = decodeToken(accessToken);
            if (decoded) {
                const userRole = extractRole(decoded);
                
                setUser({
                    id: decoded.sub,
                    email: decoded.email,
                    ...decoded,
                });
                setRole(userRole);
            }
        }
        setLoading(false);
    }, []);

    // Listen for auth changes from other tabs/windows
    useEffect(() => {
        const handleAuthChange = () => {
            const accessToken = localStorage.getItem('accessToken');
            
            if (accessToken) {
                const decoded = decodeToken(accessToken);
                if (decoded) {
                    const userRole = extractRole(decoded);
                    
                    setUser({
                        id: decoded.sub,
                        email: decoded.email,
                        ...decoded,
                    });
                    setRole(userRole);
                }
            } else {
                setUser(null);
                setRole(null);
            }
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const decoded = decodeToken(accessToken);
        if (decoded) {
            const userRole = extractRole(decoded);
            
            setUser({
                id: decoded.sub,
                email: decoded.email,
                ...decoded,
            });
            setRole(userRole);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setRole(null);
    };

    const isAuthenticated = !!user && !!localStorage.getItem('accessToken');

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
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
