import axiosClient from "../api/axiosClient";

export const adminTeamApi = {
    // Get all rescue teams
    getAllTeams: async (page = 0, size = 10) => {
        try {
            const response = await axiosClient.get('/api/admin/rescue-teams', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error("Get all teams failed:", error);
            throw error;
        }
    },

    // Get single team details with members
    getTeamById: async (teamId) => {
        try {
            const response = await axiosClient.get(`/api/admin/rescue-teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error("Get team detail failed:", error);
            throw error;
        }
    },

    // Create new rescue team
    createTeam: async (teamData) => {
        try {
            const response = await axiosClient.post('/api/admin/rescue-teams', teamData);
            return response.data;
        } catch (error) {
            console.error("Create team failed:", error);
            throw error;
        }
    },

    // Update team (name, leader, add members)
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
    },

    // Remove member from team
    removeMember: async (teamId, userId) => {
        try {
            const response = await axiosClient.delete(`/api/admin/rescue-teams/${teamId}/members/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Remove member failed:", error);
            throw error;
        }
    },

    // Get available users (for adding to team)
    getAvailableUsers: async () => {
        try {
            const response = await axiosClient.get('/api/admin/users', {
                params: { role: 'RESCUE_TEAM' }
            });
            return response.data;
        } catch (error) {
            console.error("Get available users failed:", error);
            throw error;
        }
    },

    // Lấy users có role RESCUE_TEAM và CHƯA thuộc đội nào
    getAvailableRescueMembers: async () => {
        try {
            const response = await axiosClient.get('/api/admin/rescue-teams/available-rescue-members');
            return response.data;
        } catch (error) {
            console.error("Get available rescue members failed:", error);
            throw error;
        }
    }
};
