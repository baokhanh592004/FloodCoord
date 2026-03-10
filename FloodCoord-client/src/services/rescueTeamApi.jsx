import axiosClient from "../api/axiosClient";

export const rescueTeamApi = {

  // Lấy các nhiệm vụ đang thực hiện (Assigned/In Progress)
  getAssignedMissions: async () => {
    try {
      const response = await axiosClient.get("/api/team-leader/my-rescue-requests");
      return response.data;
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

  // Kiểm tra điểm danh
  checkAttendance: async (requestId) => {
    try {
      const response = await axiosClient.get(`/api/team-leader/attendance/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Check attendance failed:", error);
      throw error;
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
   * MỚI: Gửi báo cáo hoàn thành nhiệm vụ kèm hình ảnh/video
   * @param {Object} reportData - Chứa rescuedPeople, note, remainSupplies...
   * @param {File[]} mediaFiles - Mảng các file hình ảnh/video từ input
   */
  submitReport: async (requestId, reportData, mediaFiles = []) => {
    try {
      const formData = new FormData();

      // Cấu trúc object khớp với ReportRequestDTO bên Java
      const dataPayload = {
        requestId: requestId,
        rescuedPeople: parseInt(reportData.rescuedPeople),
        note: reportData.notes || reportData.note,
        remainSupplies: reportData.remainSupplies || []
      };

      // Vì Back-end dùng ObjectMapper.readValue(data, ...), ta phải gửi payload dưới dạng chuỗi JSON
      formData.append("data", JSON.stringify(dataPayload));

      // Thêm các file vào formData nếu có
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