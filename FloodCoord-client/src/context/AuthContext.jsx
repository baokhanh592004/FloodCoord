import { LogOut } from 'lucide-react';
import React, {createContext, useContext, useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const storeUser = localStorage.getItem('user');

            if (token && storeUser) {
                // verify token
                const isValid = await verifyToken(token);

                if (isValid) {
                    setUser(JSON.parse(storeUser));
                    setIsAuthenticated(true);
                }
                else {
                    logout();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const verifyToken = async (token) => {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    // Login function
    const login = async (credentials) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            setIsAuthenticated(true);

            return data;
        } catch (error) {
            throw error;
        }
    };

    // Register function
    const register = async (registrationData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };  

    // Update user function
    const updateUser = (updateData) => {
        const updateUser = {...user, ...updateData};
        localStorage.setItem('user', JSON.stringify(updateUser));
        setUser(updateUser);
    };

    const value = {
        user, isAuthenticated, isLoading, 
        login, register, logout, updateUser, 
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;