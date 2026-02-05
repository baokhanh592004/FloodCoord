import axiosClient from "../api/axiosClient";

export const rescueApi = {
    // Tạo yêu cầu cứu hộ (không cần login)
    requestRescue: async (data) => {
        try {
            const response = await axiosClient.post('/api/rescue-requests', data);
            return response.data;
        } catch (error) {
            console.error("Gửi yêu cầu cứu trợ thất bại:", error);
            throw error;
        }
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
    }
};
