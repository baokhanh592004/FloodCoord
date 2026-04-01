import axiosClient from "../api/axiosClient";

export const vehicleApi = {
    // Get all vehicles
    getAllVehicles: async (page = 0, size = 10, params = {}) => {
        try {
            const response = await axiosClient.get('/api/manager/vehicles', {
                params: { page, size, ...params }
            });
            return response.data;
        } catch (error) {
            console.error("Get all vehicles failed:", error);
            throw error;
        }
    },

    // Get available vehicles (status = AVAILABLE)
    getAvailableVehicles: async (page = 0, size = 100) => {
        try {
            const response = await axiosClient.get('/api/manager/vehicles', {
                params: { page, size, status: 'AVAILABLE' }
            });
            return response.data?.content ?? [];
        } catch (error) {
            console.error("Get available vehicles failed:", error);
            throw error;
        }
    },

    // Get single vehicle details
    getVehicleById: async (vehicleId) => {
        try {
            const response = await axiosClient.get(`/api/manager/vehicles/${vehicleId}`);
            return response.data;
        } catch (error) {
            console.error("Get vehicle detail failed:", error);
            throw error;
        }
    },

    // Create new vehicle (Manager only)
    createVehicle: async (vehicleData) => {
        try {
            const response = await axiosClient.post('/api/manager/vehicles', vehicleData);
            return response.data;
        } catch (error) {
            console.error("Create vehicle failed:", error);
            throw error;
        }
    },

    // Update vehicle
    updateVehicle: async (vehicleId, vehicleData) => {
        try {
            const response = await axiosClient.put(`/api/manager/vehicles/${vehicleId}`, vehicleData);
            return response.data;
        } catch (error) {
            console.error("Update vehicle failed:", error);
            throw error;
        }
    },

    // Delete vehicle
    deleteVehicle: async (vehicleId) => {
        try {
            const response = await axiosClient.delete(`/api/manager/vehicles/${vehicleId}`);
            return response.data;
        } catch (error) {
            console.error("Delete vehicle failed:", error);
            throw error;
        }
    }
};
