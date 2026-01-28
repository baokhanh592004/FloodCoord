import axiosClient from "../api/axiosClient";

export const loginApi = {
    login: async (data) => {
        const response = await axiosClient.post('/api/auth/login', data);
        return response.data;
    },
    
    logout: async (accessToken) => {
        const response = await axiosClient.post('/api/auth/logout', null, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    },
    
    refreshToken: async (refreshToken) => {
        const response = await axiosClient.post('/api/auth/refresh', {
            refreshToken,
        });
        return response.data;
    },
};
    