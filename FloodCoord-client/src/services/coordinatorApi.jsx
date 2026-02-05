import axiosClient from "../api/axiosClient";

export const coordinatorApi = {
    // Dashboard statistics
    getDashboardStats: async () => {
        try {
            const response = await axiosClient.get('/api/coordinator/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error("Get dashboard stats failed:", error);
            throw error;
        }
    },

    // Get all rescue requests with filters
    getAllRequests: async (params = {}) => {
        try {
            const response = await axiosClient.get('/api/coordinator/requests', { params });
            return response.data;
        } catch (error) {
            console.error("Get all requests failed:", error);
            throw error;
        }
    },

    // Get single request detail
    getRequestDetail: async (requestId) => {
        try {
            const response = await axiosClient.get(`/api/coordinator/requests/${requestId}`);
            return response.data;
        } catch (error) {
            console.error("Get request detail failed:", error);
            throw error;
        }
    },

    // Verify a pending request (PENDING -> VERIFIED)
    verifyRequest: async (requestId, data) => {
        try {
            const response = await axiosClient.post(
                `/api/coordinator/requests/${requestId}/verify`,
                data
            );
            return response.data;
        } catch (error) {
            console.error("Verify request failed:", error);
            throw error;
        }
    },

    // Assign team, vehicle, supplies to a verified request (VERIFIED -> IN_PROGRESS)
    assignTask: async (requestId, assignmentData) => {
        try {
            const response = await axiosClient.post(
                `/api/coordinator/requests/${requestId}/assign`,
                assignmentData
            );
            return response.data;
        } catch (error) {
            console.error("Assign task failed:", error);
            throw error;
        }
    },

    // Get requests by status
    getRequestsByStatus: async (status) => {
        try {
            const response = await axiosClient.get('/api/coordinator/requests', {
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error("Get requests by status failed:", error);
            throw error;
        }
    },

    // Cancel a request
    cancelRequest: async (requestId, reason) => {
        try {
            const response = await axiosClient.post(
                `/api/coordinator/requests/${requestId}/cancel`,
                { reason }
            );
            return response.data;
        } catch (error) {
            console.error("Cancel request failed:", error);
            throw error;
        }
    }
};
