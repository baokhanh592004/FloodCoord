import axiosClient from '../api/axiosClient';

export const incidentReportApi = {
    createIncident: async ({ rescueRequestId, title, description, files = [] }) => {
        const formData = new FormData();
        formData.append('rescueRequestId', rescueRequestId);
        formData.append('title', title || 'Sự cố nhiệm vụ');
        formData.append('description', description || '');

        if (Array.isArray(files) && files.length > 0) {
            files.forEach((file) => formData.append('files', file));
        }

        try {
            const response = await axiosClient.post('/api/incidents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Create incident failed:', error);
            throw error;
        }
    },

    getPendingIncidents: async () => {
        try {
            const response = await axiosClient.get('/api/incidents/pending');
            return response.data;
        } catch (error) {
            console.error('Get pending incidents failed:', error);
            throw error;
        }
    },

    getAllIncidents: async () => {
        try {
            const response = await axiosClient.get('/api/incidents');
            return response.data;
        } catch (error) {
            console.error('Get all incidents failed:', error);
            throw error;
        }
    },

    resolveIncident: async (incidentId, payload) => {
        try {
            const response = await axiosClient.post(`/api/incidents/${incidentId}/resolve`, payload);
            return response.data;
        } catch (error) {
            console.error('Resolve incident failed:', error);
            throw error;
        }
    }
};
