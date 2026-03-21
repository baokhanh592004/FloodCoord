import axiosClient from '../api/axiosClient';

export const incidentReportApi = {
    // Lấy toàn bộ lịch sử báo cáo sự cố (dành cho trang danh sách chung)
    getAllIncidents: async () => {
        try {
            const response = await axiosClient.get('/api/incidents');
            return response.data;
        } catch (error) {
            console.error('Get all incidents failed:', error);
            throw error;
        }
    },

    // Lấy danh sách sự cố đang chờ xử lý (tuỳ trang)
    getPendingIncidents: async () => {
        try {
            const response = await axiosClient.get('/api/incidents/pending');
            return response.data;
        } catch (error) {
            console.error('Get pending incidents failed:', error);
            throw error;
        }
    },

    // Coordinator xử lý sự cố (quyết định CONTINUE hoặc ABORT)
    resolveIncident: async (incidentId, resolveData) => {
        try {
            const response = await axiosClient.post(`/api/incidents/${incidentId}/resolve`, resolveData);
            return response.data; // ResponseEntity<String>
        } catch (error) {
            console.error('Resolve incident failed:', error);
            throw error;
        }
    }
};
