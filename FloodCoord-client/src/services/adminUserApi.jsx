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

    // Get all roles (for dropdown selection)
    getAllRoles: async () => {
        try {
            const response = await axiosClient.get('/api/roles');
            return response.data;
        } catch (error) {
            console.error("Get roles failed:", error);
            // Fallback to hardcoded roles if API not available
            return [
                { id: 1, roleCode: 'ADMIN', roleName: 'Quản Trị Viên', roleDescription: 'Toàn quyền quản lý hệ thống' },
                { id: 2, roleCode: 'MANAGER', roleName: 'Quản Lý', roleDescription: 'Quản lý nghiệp vụ và người dùng' },
                { id: 3, roleCode: 'COORDINATOR', roleName: 'Điều Phối Viên', roleDescription: 'Điều phối hoạt động và đội nhóm' },
                { id: 4, roleCode: 'RESCUE_TEAM', roleName: 'Đội Cứu Hộ', roleDescription: 'Thực hiện công tác cứu hộ, cứu nạn' },
                { id: 5, roleCode: 'MEMBER', roleName: 'Thành Viên', roleDescription: 'Người dùng thông thường' }
            ];
        }
    }
};
