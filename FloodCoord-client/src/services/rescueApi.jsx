import axiosClient from "../api/axiosClient";

export const rescueApi = {
    // Không cần accessToken ở tham số đầu vào
    requestRescue: async (data) => {
        try {
            // Backend cần cấu hình endpoint này là Public (permitAny)
            const response = await axiosClient.post('/api/rescue-requests', data);
            return response.data;
        } catch (error) {
            console.error("Gửi yêu cầu cứu trợ thất bại:", error);
            throw error;
        }
    }
};
