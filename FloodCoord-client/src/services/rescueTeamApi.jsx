import axiosClient from "../api/axiosClient";

export const rescueTeamApi = {
  // Lấy các nhiệm vụ đang thực hiện
  getAssignedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/my-rescue-requests");
      return response.data || []; // Đảm bảo luôn trả về mảng
    } catch (error) {
      console.error("Get missions failed:", error);
      throw error;
    }
  },

  // Lấy danh sách nhiệm vụ đã hoàn thành
  getCompletedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/completed-requests");
      return response.data || [];
    } catch (error) {
      console.error("Get completed missions failed:", error);
      throw error;
    }
  },

  // Cập nhật tiến độ nhiệm vụ (PUT status)
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

  // Kiểm tra điểm danh (Xem đã điểm danh cho request này chưa)
  checkAttendance: async (requestId) => {
    try {
      const response = await axiosClient.get(`/api/team-leader/attendance/${requestId}`);
      return response.data || []; // Nếu chưa có, trả về mảng rỗng
    } catch (error) {
      console.error("Check attendance failed:", error);
      return []; // Trả về mảng rỗng thay vì ném lỗi để UI dễ xử lý
    }
  },

  // Gửi danh sách điểm danh (POST)
  markAttendance: async (data) => {
    try {
      // Data cấu trúc: { requestId: id, attendanceList: [{memberId: 1, status: 'PRESENT'}, ...] }
      const response = await axiosClient.post("/api/team-leader/attendance", data);
      return response.data;
    } catch (error) {
      console.error("Mark attendance failed:", error);
      throw error;
    }
  },

  /**
   * Gửi báo cáo hoàn thành nhiệm vụ kèm hình ảnh/video
   */
  submitReport: async (requestId, reportData, mediaFiles = []) => {
    try {
      const formData = new FormData();

      // Đồng bộ hóa với ReportRequestDTO bên Backend
      const dataPayload = {
        requestId: requestId,
        rescuedPeople: parseInt(reportData.rescuedPeople) || 0,
        note: reportData.note || reportData.notes || "", 
        remainSupplies: (reportData.remainSupplies || []).map(item => ({
          requestSupplyId: item.requestSupplyId,
          remainingQuantity: parseInt(item.remainingQuantity) || 0
        }))
      };

      // Backend (Java) thường nhận JSON String thông qua @RequestPart
      formData.append("data", JSON.stringify(dataPayload));

      // Thêm file đa phương tiện
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append("mediaFiles", file);
        });
      }

      const response = await axiosClient.post("/api/team-leader/report", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Submit report failed:", error);
      throw error;
    }
  }
};