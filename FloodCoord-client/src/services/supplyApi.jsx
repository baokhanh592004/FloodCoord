import axiosClient from "../api/axiosClient";

export const supplyApi = {
    // Get all supplies
    getAllSupplies: async (page = 0, size = 10, params = {}) => {
        try {
            const response = await axiosClient.get('/api/manager/supplies', {
                params: { page, size, ...params }
            });
            return response.data;
        } catch (error) {
            console.error("Get all supplies failed:", error);
            throw error;
        }
    },

    // Get available supplies (quantity > 0)
    getAvailableSupplies: async (page = 0, size = 100) => {
        try {
            const response = await axiosClient.get('/api/manager/supplies', {
                params: { page, size, available: true }
            });
            return response.data?.content ?? [];
        } catch (error) {
            console.error("Get available supplies failed:", error);
            throw error;
        }
    },

    // Get single supply details
    getSupplyById: async (supplyId) => {
        try {
            const response = await axiosClient.get(`/api/manager/supplies/${supplyId}`);
            return response.data;
        } catch (error) {
            console.error("Get supply detail failed:", error);
            throw error;
        }
    },

    // Create new supply (Manager only)
    createSupply: async (supplyData) => {
        try {
            const response = await axiosClient.post('/api/manager/supplies', supplyData);
            return response.data;
        } catch (error) {
            console.error("Create supply failed:", error);
            throw error;
        }
    },

    // Update supply
    updateSupply: async (supplyId, supplyData) => {
        try {
            const response = await axiosClient.put(`/api/manager/supplies/${supplyId}`, supplyData);
            return response.data;
        } catch (error) {
            console.error("Update supply failed:", error);
            throw error;
        }
    },

    // Delete supply
    deleteSupply: async (supplyId) => {
        try {
            const response = await axiosClient.delete(`/api/manager/supplies/${supplyId}`);
            return response.data;
        } catch (error) {
            console.error("Delete supply failed:", error);
            throw error;
        }
    }
};
