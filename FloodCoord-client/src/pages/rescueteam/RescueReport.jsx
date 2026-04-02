import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import toast from "react-hot-toast";
import { CubeIcon, UserGroupIcon, ChevronLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function RescueReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({ rescuedPeople: "", note: "" });
    const [supplies, setSupplies] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy dữ liệu từ danh sách nhiệm vụ đã hoàn thành để đảm bảo lấy được ID vật tư chính xác
useEffect(() => {
    const loadData = async () => {
        try {
            const res = await rescueTeamApi.getCompletedMissions();
            const mission = res.find(m => String(m.requestId) === String(id));
            if (mission) {
                setForm({ rescuedPeople: mission.peopleCount || 0, note: "" });
                
                // 🔥 SỬA: Lấy s.supplyId từ API (Bây giờ nó đã là ID của RequestSupply nhờ bước sửa Backend ở trên)
                const originalSupplies = mission.supplies.map(s => ({
                    requestSupplyId: s.supplyId, // Đây chính là rs.getId() từ Backend trả về
                    supplyName: s.supplyName,
                    allocatedQuantity: s.quantity,
                    unit: s.unit,
                    remainingQuantity: 0 
                }));

                setSupplies(originalSupplies);
            }
        } catch {
            toast.error("Lỗi tải dữ liệu");
        }
    };
    loadData();
}, [id]);

const handleSupplyChange = (requestSupplyId, value) => {
        let qty = parseInt(value) || 0;
        setSupplies(prev => prev.map(s => {
            if (s.requestSupplyId === requestSupplyId) {
                // Đảm bảo số dư không âm và không vượt quá tổng nhận
                const safeQty = Math.max(0, Math.min(qty, s.allocatedQuantity));
                return { ...s, remainingQuantity: safeQty };
            }
            return s;
        }));
    };

const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.rescuedPeople || parseInt(form.rescuedPeople) < 0) {
            toast.error("Nhập số người hợp lệ");
            return;
        }

        setIsSubmitting(true);
        try {
            const reportPayload = {
                requestId: id,
                rescuedPeople: form.rescuedPeople,
                note: form.note,
                remainSupplies: supplies.map(s => ({
                    requestSupplyId: s.requestSupplyId,
                    remainingQuantity: s.remainingQuantity
                }))
            };

            await rescueTeamApi.submitReport(id, reportPayload, selectedFiles);
            toast.success("Báo cáo thành công! Kho đã được cập nhật.");
            navigate("/rescue-team/missions");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi nộp báo cáo");
        } finally {
            setIsSubmitting(false);
        }
    };

const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            toast.error("Tối đa 5 ảnh");
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-7 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full group transition-all">
            <ChevronLeftIcon className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#0D9488] uppercase tracking-tight">Báo cáo & Hoàn kho</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono uppercase tracking-widest">#{id}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center custom-scrollbar">
        <form onSubmit={handleSubmit} className="w-full max-w-6xl flex flex-col gap-6">
          <div className="grid grid-cols-12 gap-6">
            
            {/* CỨU SỐNG */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-center text-center transition-all hover:shadow-md">
              <UserGroupIcon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <label className="text-[11px] font-black uppercase text-slate-500 mb-4 tracking-widest">Số người đã cứu *</label>
              <input
                type="number"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl p-5 text-6xl font-black text-center text-blue-600 outline-none shadow-inner"
                value={form.rescuedPeople}
                onChange={(e) => setForm({ ...form, rescuedPeople: e.target.value })}
              />
            </div>

            {/* VẬT TƯ */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-amber-600">
                <CubeIcon className="w-6 h-6" strokeWidth={2.5} />
                <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Kê khai vật tư trả kho</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplies.length > 0 ? supplies.map((s) => (
                  <div key={s.requestSupplyId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-300 transition-all">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 capitalize">{s.supplyName}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Nhận: {s.allocatedQuantity} {s.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200">
                      <span className="text-[9px] font-black text-amber-500 uppercase">Dư:</span>
                      <input
                        type="number"
                        value={s.remainingQuantity}
                        onChange={(e) => handleSupplyChange(s.requestSupplyId, e.target.value)}
                        className="w-12 text-center font-black text-slate-800 outline-none border-b-2 border-slate-50 focus:border-amber-500 transition-all"
                      />
                      <span className="text-[9px] font-bold text-slate-400">{s.unit}</span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <ExclamationCircleIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Nhiệm vụ không có vật tư cấp phát</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GHI CHÚ */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4">Nhật ký quá trình thực thi</h2>
            <textarea
              placeholder="Ghi chú chi tiết kết quả nhiệm vụ..."
              className="w-full h-28 p-5 bg-slate-50 border-2 border-transparent focus:border-[#0D9488] focus:bg-white rounded-3xl text-slate-700 text-sm font-medium outline-none resize-none transition-all shadow-inner leading-relaxed"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          {/* HÌNH ẢNH */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Minh chứng hiện trường (Tối đa 5)</h2>
              <button type="button" onClick={() => fileInputRef.current.click()} className="bg-[#F0FDFA] text-[#0D9488] px-6 py-2 rounded-xl text-[10px] font-black hover:bg-[#0D9488] hover:text-white transition-all shadow-sm">Tải ảnh lên</button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {previews.map((url, index) => (
                <div key={index} className="group relative aspect-square rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm transition-all">
                  <img src={url} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <button type="button" onClick={() => removeFile(index)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0F172A] hover:bg-black text-white font-black py-5 rounded-3xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div> : "XÁC NHẬN & CHỐT HỒ SƠ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}