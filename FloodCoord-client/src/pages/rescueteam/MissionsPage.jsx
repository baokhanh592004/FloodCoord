// src/pages/rescueteam/MissionsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MissionsPage() {
  const [missions, setMissions] = useState([]); // Danh sách nhiệm vụ được phân công
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState("MOVING");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Gọi API lấy danh sách nhiệm vụ được giao cho đội cứu hộ
  
 useEffect(() => {
  const fetchMissions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/coordinator/requests/rescue-requests");
      setMissions(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách nhiệm vụ:", err);
    }
  };

  fetchMissions();
}, []);

  // 🔹 Gửi cập nhật tiến độ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) {
      alert("Vui lòng chọn Request ID!");
      return;
    }

    setLoading(true);
    try {
      let media = [];

      // Nếu có ảnh upload, gọi API upload ảnh
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await axios.post(
          "http://localhost:8080/api/media/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        media.push({
          mediaType: "image",
          mediaUrl:
            uploadRes.data.url ||
            uploadRes.data.secure_url ||
            uploadRes.data,
        });
      }

      // Body gửi lên API PUT
      const body = {
        status,
        note,
        media,
      };

      const res = await axios.put(
        `http://localhost:8080/api/mission/requests/${requestId}/progress`,
        body,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("✅ Cập nhật tiến độ thành công!");
      console.log("Response:", res.data);
      setNote("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("❌ Cập nhật tiến độ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">
        🚑 Cập nhật tiến độ cứu hộ
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 🔹 Dropdown chọn nhiệm vụ */}
        <label className="block mb-2 font-medium">Chọn nhiệm vụ</label>
        <select
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          required
        >
          <option value="">-- Chọn nhiệm vụ được giao --</option>
          {missions.map((m) => (
            <option key={m.requestId} value={m.requestId}>
              {m.title || `Nhiệm vụ ${m.requestId}`} ({m.status})
            </option>
          ))}
        </select>

        {/* Status */}
        <label className="block mb-2 font-medium">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        >
          <option value="PENDING">PENDING</option>
          <option value="MOVING">MOVING</option>
          <option value="ARRIVED">ARRIVED</option>
          <option value="RESCUING">RESCUING</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        {/* Note */}
        <label className="block mb-2 font-medium">Ghi chú</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          rows={4}
          placeholder="Nhập mô tả chi tiết tiến độ..."
        />

        {/* Upload file */}
        <label className="block mb-2 font-medium">
          Ảnh minh chứng (tùy chọn)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Cập nhật tiến độ"}
        </button>
      </form>
    </div>
  );
}