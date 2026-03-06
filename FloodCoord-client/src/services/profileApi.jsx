import axiosClient from "../api/axiosClient";

export const profileApi = {
    getProfile: async () => {
        const response = await axiosClient.get('/api/profile/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await axiosClient.put('/api/profile/update', data);
        return response.data;
    },
};
