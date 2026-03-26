import axiosClient from "../api/axiosClient";

export const adminDashboardApi = {
  getStats: async (params) => {
    // Truyền startDate, endDate, compareStartDate, compareEndDate vào query string
    const response = await axiosClient.get('/api/admin/dashboard', { params });
    // Trả về dữ liệu gốc để Component tự xử lý result
    return response.data?.result || response.data; 
  }
};