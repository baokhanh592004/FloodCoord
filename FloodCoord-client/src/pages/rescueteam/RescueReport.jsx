import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";

export default function RescueReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rescuedPeople: "",
    injuredPeople: "",
    notes: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rescuedPeople) {
      alert("Vui lòng nhập số người đã cứu");
      return;
    }
    try {
      await rescueTeamApi.createReport(id, form);
      alert("Báo cáo đã gửi thành công!");
      navigate("/rescue-team/missions");
    } catch (error) {
      console.error(error);
      alert("Gửi báo cáo thất bại");
    }
  };

  return (
    <div className="p-8 lg:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lập báo cáo tổng kết</h1>
        <p className="text-slate-500 text-sm mt-1">Ghi chú lại kết quả sau khi hoàn thành nhiệm vụ #{id}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-sm border border-slate-100 rounded-2xl p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* rescued people */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Số người đã cứu thành công <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="VD: 5"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800"
              value={form.rescuedPeople}
              onChange={(e) => setForm({ ...form, rescuedPeople: e.target.value })}
            />
          </div>

          {/* injured people */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Số người bị thương (nếu có)
            </label>
            <input
              type="number"
              min="0"
              placeholder="VD: 1"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800"
              value={form.injuredPeople}
              onChange={(e) => setForm({ ...form, injuredPeople: e.target.value })}
            />
          </div>
        </div>

        {/* notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Ghi chú / Tình hình thực tế hiện trường
          </label>
          <textarea
            rows="5"
            placeholder="Mô tả chi tiết quá trình cứu hộ, khó khăn gặp phải, tình trạng sức khỏe nạn nhân..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 resize-y"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {/* buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
          >
            Gửi báo cáo
          </button>
          <button
            type="button"
            onClick={() => navigate("/rescue-team/missions")}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Hủy và Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}