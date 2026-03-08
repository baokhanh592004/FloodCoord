import axiosClient from "../api/axiosClient";

export const adminUserApi = {
    // Get all users
    getAllUsers: async () => {
        try {
            const response = await axiosClient.get('/api/admin/users');
            return response.data;
        } catch (error) {
            console.error("Get all users failed:", error);
            throw error;
        }
    },

    // Get single user
    getUserById: async (userId) => {
        try {
            const response = await axiosClient.get(`/api/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Get user detail failed:", error);
            throw error;
        }
    },

    // Create new user (Admin only)
    createUser: async (userData) => {
        try {
            const response = await axiosClient.post('/api/admin/users', userData);
            return response.data;
        } catch (error) {
            console.error("Create user failed:", error);
            throw error;
        }
    },

    // Update user (including role)
    updateUser: async (userId, userData) => {
        try {
            const response = await axiosClient.put(`/api/admin/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error("Update user failed:", error);
            throw error;
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            const response = await axiosClient.delete(`/api/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Delete user failed:", error);
            throw error;
        }
    },

    getAllRoles: async () => {
        try {
            const response = await axiosClient.get('/api/roles');
            return response.data;
        } catch (error) {
            console.error("Get roles failed:", error);
            return [];
        }
    }
};
