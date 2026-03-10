import axiosClient from "../api/axiosClient";

export const rescueApi = {
    // Tạo yêu cầu cứu hộ (không cần login)
    requestRescue: async (formData) => {
    return axiosClient.post('/api/rescue-requests', formData);
    },

    // Tra cứu trạng thái đơn bằng tracking code (không cần login)
    trackRequest: async (code) => {
        try {
            const response = await axiosClient.get('/api/rescue-requests/track', {
                params: { code }
            });
            return response.data;
        } catch (error) {
            console.error("Tra cứu tracking code thất bại:", error);
            throw error;
        }
    },

    // Lấy danh sách yêu cầu cứu hộ của người dùng hiện tại
    getMyRescueRequests: async () => {
        const response = await axiosClient.get('/api/rescue-requests/my-requests');
        return response.data;
    },
    // Người dân gửi đánh giá / xác nhận hoàn thành (không cần login)
    confirmAndFeedback: async (requestId, payload) => {
        try {
            const response = await axiosClient.post(`/api/rescue-requests/${requestId}/confirm`, payload);
            return response.data;
        } catch (error) {
            console.error("Gửi đánh giá thất bại:", error);
            throw error;
        }
    }
};
