import axiosClient from '../api/axiosClient';

export const rescueReportApi = {
    getReportedRequests: async () => {
        try {
            const response = await axiosClient.get('/api/coordinator/requests/reported');
            return response.data;
        } catch (error) {
            console.error('Get reported requests failed:', error);
            throw error;
        }
    },

    getReportDetail: async (requestId) => {
        try {
            const response = await axiosClient.get(`/api/coordinator/requests/${requestId}/report`);
            return response.data;
        } catch (error) {
            console.error('Get report detail failed:', error);
            throw error;
        }
    }
};
