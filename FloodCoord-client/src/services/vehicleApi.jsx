import axiosClient from "../api/axiosClient";

export const vehicleApi = {
    // Get all vehicles
    getAllVehicles: async () => {
        try {
            const response = await axiosClient.get('/api/manager/vehicles');
            return response.data;
        } catch (error) {
            console.error("Get all vehicles failed:", error);
            throw error;
        }
    },

    // Get available vehicles (status = AVAILABLE)
    getAvailableVehicles: async () => {
        try {
            const response = await axiosClient.get('/api/manager/vehicles', {
                params: { status: 'AVAILABLE' }
            });
            return response.data;
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
