import axiosClient from "../api/axiosClient";

export const rescueTeamApi = {
  // Lấy các nhiệm vụ đang thực hiện
  getAssignedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/my-rescue-requests");
      return response.data || [];
    } catch (error) {
      console.error("Get missions failed:", error);
      throw error;
    }
  },

  // Lấy danh sách nhiệm vụ đã hoàn thành (Dùng để lấy vật tư đi báo cáo)
  getCompletedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/completed-requests");
      return response.data || [];
    } catch (error) {
      console.error("Get completed missions failed:", error);
      throw error;
    }
  },

  // Cập nhật tiến độ nhiệm vụ
  updateProgress: async (requestId, data) => {
    try {
      const response = await axiosClient.put(`/api/team-leader/rescue-request/${requestId}/status`, data);
      return response.data;
    } catch (error) {
      console.error("Update progress failed:", error);
      throw error;
    }
  },

  // Lấy danh sách thành viên trong đội
  getTeamMembers: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/team-members");
      return response.data || [];
    } catch (error) {
      console.error("Get team members failed:", error);
      throw error;
    }
  },

  // Kiểm tra điểm danh
  checkAttendance: async (requestId) => {
    try {
      const response = await axiosClient.get(`/api/team-leader/attendance/${requestId}`);
      return response.data || [];
    } catch (error) {
      console.error("Check attendance failed:", error);
      return [];
    }
  },

  // Gửi danh sách điểm danh
  markAttendance: async (data) => {
    try {
      const response = await axiosClient.post("/api/team-leader/attendance", data);
      return response.data;
    } catch (error) {
      console.error("Mark attendance failed:", error);
      throw error;
    }
  },

  /**
   * Gửi báo cáo hoàn thành nhiệm vụ kèm hình ảnh/video
   * Đã sửa định dạng FormData để khớp với @ModelAttribute List<DTO> của Spring Boot
   */
submitReport: async (requestId, reportData, mediaFiles = []) => {
        const formData = new FormData();
        formData.append("requestId", requestId);
        formData.append("rescuedPeople", parseInt(reportData.rescuedPeople) || 0);
        formData.append("note", reportData.note || "");

        if (reportData.remainSupplies?.length > 0) {
            reportData.remainSupplies.forEach((item, index) => {
                formData.append(`remainSupplies[${index}].requestSupplyId`, item.requestSupplyId);
                formData.append(`remainSupplies[${index}].remainingQuantity`, parseInt(item.remainingQuantity) || 0);
            });
        }

        if (mediaFiles?.length > 0) {
            mediaFiles.forEach(file => formData.append("mediaFiles", file));
        }

        return await axiosClient.post("/api/team-leader/report", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }
};