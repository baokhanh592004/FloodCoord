import axiosClient from "../api/axiosClient";

export const rescueTeamApi = {

  // lấy nhiệm vụ của team
  getAssignedMissions: async () => {
    try {
      const response = await axiosClient.get(
        "/api/team-leader/my-rescue-requests"
      );
      return response.data;
    } catch (error) {
      console.error("Get missions failed:", error);
      throw error;
    }
  },

  // cập nhật tiến độ
updateProgress: async (requestId, data) => {
  try {
    const response = await axiosClient.put(
      `/api/mission/requests/${requestId}/progress`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update progress failed:", error);
    throw error;
  }
}

};