RescueReport

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { rescueTeamApi } from "../../services/rescueTeamApi";
import toast from "react-hot-toast";

export default function RescueReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    rescuedPeople: "",
    notes: ""
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]); // Chứa URL để xem trước ảnh
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.suggestedPeople) {
      setForm(prev => ({ ...prev, rescuedPeople: location.state.suggestedPeople }));
    }
  }, [location.state]);

  // Xử lý khi chọn file: Tạo preview để hiển thị to rõ
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rescuedPeople) {
      toast.error("Vui lòng nhập số người đã cứu");
      return;
    }
    setIsSubmitting(true);
    try {
      await rescueTeamApi.submitReport(id, form, selectedFiles);
      toast.success("Báo cáo thành công!");
      navigate("/rescue-team/missions");
    } catch (error) {
      toast.error("Gửi thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 overflow-hidden">
      
      {/* HEADER TỐI GIẢN */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Lập báo cáo kết quả</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">MISSION ID: #{id?.slice(0,8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">Dự kiến: {location.state?.suggestedPeople || 0} người</span>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center custom-scrollbar">
        <form onSubmit={handleSubmit} className="w-full max-w-5xl flex flex-col gap-6">
          
          {/* PHẦN 1: SỐ LIỆU & GHI CHÚ NẰM NGANG Ở TRÊN */}
          <div className="grid grid-cols-12 gap-6 shrink-0">
            {/* Nhập số người */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-center text-center group transition-all hover:shadow-md">
              <div className="flex items-center justify-center gap-2 mb-4 text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
                <label className="text-[11px] font-black uppercase tracking-[0.1em]">Người đã cứu sống *</label>
              </div>
              <input
                type="number"
                placeholder="0"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 text-5xl font-black text-center text-blue-600 outline-none transition-all shadow-inner"
                value={form.rescuedPeople}
                onChange={(e) => setForm({ ...form, rescuedPeople: e.target.value })}
              />
            </div>

            {/* Nhập ghi chú chi tiết */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col transition-all hover:shadow-md">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <h2 className="text-[11px] font-black uppercase tracking-[0.1em]">Chi tiết nhật ký cứu hộ</h2>
              </div>
              <textarea
                placeholder="Mô tả ngắn gọn quá trình giải cứu và tình trạng hiện tại..."
                className="flex-1 w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl text-slate-700 text-sm font-medium outline-none resize-none transition-all shadow-inner leading-relaxed"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          {/* PHẦN 2: BẰNG CHỨNG HÌNH ẢNH TO RÕ PHÍA DƯỚI */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h2 className="text-[11px] font-black uppercase tracking-[0.1em]">Bằng chứng hiện trường</h2>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                Thêm hình ảnh
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            </div>

            {/* Grid hiển thị ảnh to rõ */}
            {previews.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {previews.map((url, index) => (
                  <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 animate-in zoom-in duration-300">
                    <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => removeFile(index)} 
                        className="bg-white text-red-500 p-2 rounded-full shadow-lg hover:scale-110 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                       <p className="bg-black/50 backdrop-blur px-2 py-1 rounded text-[8px] text-white font-mono truncate">{selectedFiles[index]?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="flex-1 border-4 border-dashed border-slate-50 rounded-[1.5rem] flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-50/50 transition-all"
              >
                <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-blue-400 transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Chưa có hình ảnh</p>
              </div>
            )}
          </div>

          {/* NÚT XÁC NHẬN */}
          <div className="shrink-0 pt-2 pb-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0F172A] hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-xs"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Xác nhận & Gửi hồ sơ cứu hộ</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}