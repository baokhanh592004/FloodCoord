import axiosClient from "../api/axiosClient";

export const teamApi = {
    // Get all rescue teams
    getAllTeams: async () => {
        try {
            const response = await axiosClient.get('/api/admin/rescue-teams');
            return response.data;
        } catch (error) {
            console.error("Get all teams failed:", error);
            throw error;
        }
    },

    // Get available teams (status = AVAILABLE)
    getAvailableTeams: async () => {
        try {
            const response = await axiosClient.get('/api/admin/rescue-teams', {
                params: { status: 'AVAILABLE' }
            });
            return response.data;
        } catch (error) {
            console.error("Get available teams failed:", error);
            throw error;
        }
    },

    // Get single team details
    getTeamById: async (teamId) => {
        try {
            const response = await axiosClient.get(`/api/admin/rescue-teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error("Get team detail failed:", error);
            throw error;
        }
    },

    // Create new rescue team (Admin/Manager only)
    createTeam: async (teamData) => {
        try {
            const response = await axiosClient.post('/api/admin/rescue-teams', teamData);
            return response.data;
        } catch (error) {
            console.error("Create team failed:", error);
            throw error;
        }
    },

    // Update team
    updateTeam: async (teamId, teamData) => {
        try {
            const response = await axiosClient.put(`/api/admin/rescue-teams/${teamId}`, teamData);
            return response.data;
        } catch (error) {
            console.error("Update team failed:", error);
            throw error;
        }
    },

    // Delete team
    deleteTeam: async (teamId) => {
        try {
            const response = await axiosClient.delete(`/api/admin/rescue-teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error("Delete team failed:", error);
            throw error;
        }
    }
};
