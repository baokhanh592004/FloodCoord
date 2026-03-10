import axiosClient from "../api/axiosClient";

export const rescueTeamApi = {

  // Lấy nhiệm vụ của team
  getAssignedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/my-rescue-requests");
      return response.data;
    } catch (error) {
      console.error("Get missions failed:", error);
      throw error;
    }
  },

  // Cập nhật tiến độ nhiệm vụ (Đã sửa endpoint chuẩn theo backend của bạn)
  updateProgress: async (requestId, data) => {
    try {
      const response = await axiosClient.put(`/api/team-leader/rescue-request/${requestId}/status`, data);
      return response.data;
    } catch (error) {
      console.error("Update progress failed:", error);
      throw error;
    }
  },

  // GET: Kiểm tra xem nhiệm vụ này đã được điểm danh chưa
  checkAttendance: async (requestId) => {
    try {
      const response = await axiosClient.get(`/api/team-leader/attendance/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Check attendance failed:", error);
      throw error;
    }
  },

  // POST: Gửi danh sách điểm danh
  markAttendance: async (data) => {
    try {
      const response = await axiosClient.post("/api/team-leader/attendance", data);
      return response.data;
    } catch (error) {
      console.error("Mark attendance failed:", error);
      throw error;
    }
  },

  // GET: Lấy danh sách nhiệm vụ đã hoàn thành (kèm đánh giá của người dân)
  getCompletedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/completed-requests");
      return response.data;
    } catch (error) {
      console.error("Get completed missions failed:", error);
      throw error;
    }
  }

};