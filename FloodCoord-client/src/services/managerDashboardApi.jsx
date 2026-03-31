import axiosClient from "../api/axiosClient";

export const managerDashboardApi = {
  getDashboardStats: async () => {
    // Thêm .data ở đây để lấy đúng dữ liệu từ Backend
    const response = await axiosClient.get('/api/manager/dashboard');
    return response.data; 
  }
};

export default managerDashboardApi;