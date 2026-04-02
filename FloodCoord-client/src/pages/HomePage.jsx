import { useState, useRef } from "react"; // Thêm useRef
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import {
  LifeBuoy, ChevronDown, ChevronUp, ArrowRight,
  ShieldCheck, Phone, MapPin, Clock, ClipboardCheck,
  Navigation, CheckCircle2, Waves,
  AlertTriangle, Lightbulb, Info
} from "lucide-react";
import heroFloodImg from '../assets/images/logo1.png'
import beforeFloodImg from '../assets/images/thing-to-do-before-flood.png'
import afterFloodImg from '../assets/images/things-to-do-after-flood.png'
import diseaseProtectImg from '../assets/images/disease-protect.png'

const HomePage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate(); // Hook để điều hướng
  const safetySectionRef = useRef(null); // Tạo ref để cuộn tới phần cẩm nang

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Hàm xử lý cuộn trang mượt mà
  const scrollToSafety = () => {
    safetySectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const steps = [
    { id: 1, title: "Truy cập Website", desc: "Sử dụng điện thoại hoặc máy tính truy cập trang web khẩn cấp.", icon: <Waves className="w-6 h-6" /> },
    { id: 2, title: "Chọn Cứu hộ", desc: "Nhấn nút 'Yêu cầu cứu hộ' ngay tại trang chủ để bắt đầu.", icon: <LifeBuoy className="w-6 h-6" /> },
    { id: 3, title: "Nhập thông tin", desc: "Cung cấp địa chỉ chính xác và số người cần hỗ trợ.", icon: <MapPin className="w-6 h-6" /> },
    { id: 4, title: "Nhận mã theo dõi", desc: "Hệ thống cấp mã 6 số ngay lập tức mà không cần đăng nhập.", icon: <ClipboardCheck className="w-6 h-6" /> },
    { id: 5, title: "Theo dõi trạng thái", desc: "Dùng mã đã nhận để biết vị trí và thời gian đội cứu hộ đến.", icon: <Navigation className="w-6 h-6" /> },
    { id: 6, title: "Xác nhận & Phản hồi", desc: "Thông báo khi đã an toàn và góp ý để cải thiện dịch vụ.", icon: <CheckCircle2 className="w-6 h-6" /> },
  ];

  const safetyInfo = [
    {
      title: "Trước khi lũ xảy ra",
      items: ["Gia cố nhà cửa, kê cao đồ đạc", "Dự trữ thuốc men và nước uống sạch", "Xác định khu vực sơ tán cao ráo"],
      icon: <Clock className="text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "Khi đang trong lũ lụt",
      items: ["Ngắt toàn bộ nguồn điện trong nhà", "Tránh xa vùng nước xoáy, dòng chảy xiết", "Di chuyển đến điểm cao nhất có thể"],
      icon: <AlertTriangle className="text-amber-500" />,
      color: "bg-amber-50"
    },
    {
      title: "Lưu ý an toàn quan trọng",
      items: ["Sạc đầy pin dự phòng điện thoại", "Giữ liên lạc với chính quyền địa phương", "Không bơi lội trong dòng nước lũ"],
      icon: <Lightbulb className="text-sky-500" />,
      color: "bg-sky-50"
    }
  ];

  const faqs = [
    { q: "Làm sao để biết yêu cầu của tôi đã được nhận?", a: "Ngay sau khi nhấn gửi, hệ thống sẽ cấp cho bạn một mã theo dõi." },
    { q: "Tôi có mất phí khi yêu cầu cứu hộ không?", a: "Hoàn toàn không. Đây là dịch vụ công ích miễn phí." },
    { q: "Có cần đăng ký tài khoản không?", a: "Không. Chúng tôi không yêu cầu đăng nhập để tiết kiệm thời gian." },
    { q: "Cứu hộ có làm việc ban đêm không?", a: "Có. Lực lượng cứu nạn trực chiến 24/7." }
  ];

  return (
    <main>
      {/* HERO */}
      <section className="pt-8 pb-20 lg:pt-16 lg:pb-32 bg-linear-to-br from-blue-50 via-sky-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-200 px-6 py-2.5 rounded-full text-blue-700 font-bold text-sm shadow-sm">
                <ShieldCheck size={20} className="text-blue-500" />
                Hệ thống hỗ trợ khẩn cấp 24/7 của Thành phố
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-blue-900 leading-tight">
                Cùng nhau vượt qua bão lũ. <span className="text-blue-500 italic font-serif">Chúng tôi luôn ở đây.</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Bình tĩnh, hy vọng và sự an toàn của bạn là trách nhiệm của chúng tôi. Kết nối nhanh nhất với các đội cứu hộ tại TP.HCM.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                {/* SỬA 1: Điều hướng tới trang yêu cầu cứu hộ */}
                <button 
                  onClick={() => navigate('/request-rescue')} // Thay đổi path tương ứng với Route của bạn
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
                >
                  Yêu cầu cứu hộ ngay <ArrowRight size={24} />
                </button>

                {/* SỬA 2: Gọi hàm cuộn xuống khi click */}
                <button 
                  onClick={scrollToSafety}
                  className="bg-white border-2 border-blue-100 text-blue-700 hover:border-blue-300 px-10 py-6 rounded-3xl font-bold text-xl transition-all shadow-sm"
                >
                  Cẩm nang an toàn
                </button>
              </div>
            </div>

            {/* ... Phần ảnh giữ nguyên ... */}
            <div className="lg:w-1/2 relative animate-in fade-in zoom-in duration-1000">
              <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-3xl border-12 border-white ring-1 ring-blue-100">
                <img
                  src={heroFloodImg}
                  alt="Ảnh thực tế khu vực ngập lụt cần hỗ trợ cứu hộ"
                  className="w-full h-195 object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-blue-900/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="bg-blue-600/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold mb-2 inline-block">Niềm tin và Hy vọng</div>
                  <h4 className="text-2xl font-bold">Vì một TP.HCM an toàn</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6 STEPS ===== */}
      <section className="py-24 bg-white">
        {/* ... Nội dung 6 bước giữ nguyên ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-20">
             <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-6">Quy trình cứu hộ 6 bước</h2>
             <p className="text-slate-500 text-xl">Đơn giản, minh bạch và nhanh chóng.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {steps.map((step) => (
               <div key={step.id} className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   {step.icon}
                 </div>
                 <div className="text-blue-500 font-black text-sm mb-3 tracking-widest uppercase">Bước {step.id}</div>
                 <h3 className="text-2xl font-bold text-blue-950 mb-4">{step.title}</h3>
                 <p className="text-slate-600 text-lg leading-relaxed">{step.desc}</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* SỬA 3: Thêm ref vào section này để làm điểm đích cho nút bấm */}
      <section ref={safetySectionRef} className="py-24 bg-blue-50/40 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-6">Thông tin An toàn & Ứng phó</h2>
              <p className="text-slate-500 text-xl font-medium">Trang bị kiến thức đúng đắn là cách tốt nhất để bảo vệ bản thân và gia đình trước bão lũ.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {safetyInfo.map((info, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[3rem] shadow-md border border-blue-50 hover:shadow-xl transition-all">
                <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center mb-8`}>
                  {info.icon}
                </div>
                <h3 className="text-2xl font-black text-blue-900 mb-8">{info.title}</h3>
                <ul className="space-y-6">
                  {info.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-700 text-lg font-medium leading-snug">
                      <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-4">Cẩm nang trực quan</h2>
            <p className="text-slate-500 text-lg">Hình ảnh hướng dẫn ngắn gọn để chuẩn bị tốt hơn trước, trong và sau lũ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              { src: beforeFloodImg, title: 'Trước bão', desc: 'Chuẩn bị sơ tán, vật dụng thiết yếu và nguồn nước sạch.' },
              { src: afterFloodImg, title: 'Sau bão', desc: 'Tuân thủ các lưu ý an toàn khi quay lại khu vực ảnh hưởng.' },
              { src: diseaseProtectImg, title: 'Phòng dịch bệnh', desc: 'Khử khuẩn nguồn nước và vệ sinh môi trường sống đúng cách.' },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={item.src}
                  alt={item.title}
                  onClick={() => setPreviewImage(item)}
                  className="w-full h-72 object-contain bg-slate-50 p-2 cursor-zoom-in"
                />
                <div className="p-5">
                  <h3 className="text-xl font-black text-blue-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  <button
                    type="button"
                    onClick={() => setPreviewImage(item)}
                    className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Phóng to ảnh
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {previewImage && (
        <div
          className="fixed inset-0 z-80 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-11 right-0 text-white font-bold text-lg"
            >
              Đóng
            </button>
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl bg-white"
            />
          </div>
        </div>
      )}

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-slate-500 text-lg">Một số thắc mắc phổ biến khi sử dụng hệ thống cứu hộ.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-blue-950">{item.q}</span>
                    <span className="shrink-0 text-blue-600">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;