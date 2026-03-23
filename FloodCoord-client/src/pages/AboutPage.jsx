import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldExclamationIcon,
    ClipboardDocumentCheckIcon,
    UserGroupIcon,
    TruckIcon,
    CheckCircleIcon,
    StarIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CalendarIcon,
    ArrowRightIcon,
    LifebuoyIcon
} from '@heroicons/react/24/outline';

// ── DATA QUY TRÌNH ──────────────────────────────────────────────────────────
const PROCESS_STEPS = [
    {
        step: '01',
        icon: ShieldExclamationIcon,
        color: 'from-blue-400 to-blue-600',
        title: 'Gửi yêu cầu SOS',
        description: 'Người dân điền thông tin vị trí và tình trạng khẩn cấp. Hệ thống cấp mã Tracking ngay.',
        details: ['Không cần đăng nhập', 'Tự động định vị', 'Nhận mã tra cứu'],
        action: { label: 'Gửi ngay', href: '/request-rescue' },
    },
    {
        step: '02',
        icon: ClipboardDocumentCheckIcon,
        color: 'from-sky-400 to-sky-500',
        title: 'Xác minh & Điều phối',
        description: 'Điều phối viên tiếp nhận, xác thực và đánh giá mức độ khẩn cấp của yêu cầu.',
        details: ['Ưu tiên khẩn cấp', 'Cập nhật trực tiếp', 'Minh bạch trạng thái'],
    },
    {
        step: '03',
        icon: TruckIcon,
        color: 'from-cyan-400 to-cyan-500',
        title: 'Phân công cứu hộ',
        description: 'Chỉ định đội cứu hộ, phương tiện (cano, tàu, xe) phù hợp với địa hình.',
        details: ['Vật tư y tế', 'Phương tiện chuyên dụng', 'Lương thực cứu trợ'],
    },
    {
        step: '04',
        icon: UserGroupIcon,
        color: 'from-indigo-400 to-indigo-500',
        title: 'Thực hiện nhiệm vụ',
        description: 'Đội cứu hộ tiếp cận hiện trường. Người dân theo dõi vị trí GPS thời gian thực.',
        details: ['Liên lạc trực tiếp', 'Theo dõi bản đồ', 'Cập nhật trạng thái'],
    },
    {
        step: '05',
        icon: CheckCircleIcon,
        color: 'from-emerald-400 to-emerald-500',
        title: 'Hoàn thành an toàn',
        description: 'Xác nhận hoàn thành nhiệm vụ và nhận phản hồi để cải thiện chất lượng phục vụ.',
        details: ['Ghi nhận đóng góp', 'Giải phóng nguồn lực', 'Báo cáo kết quả'],
        action: { label: 'Tra cứu', href: '/track-rescue' },
    },
];

// ── DATA VIDEO ─────────────────────────────────────────────────────────────
const VIDEOS = [
    {
        title: "Toàn cảnh lũ lụt & Công tác điều phối cứu hộ 2026",
        embed: "https://www.youtube.com/embed/kfJIfOL0Udc",
        category: "Hiện trường",
        duration: "05:20"
    },
    {
        title: "Hướng dẫn kỹ năng an toàn khi nước dâng cao",
        embed: "https://www.youtube.com/embed/6C7DD1Ji1FM",
        category: "Kỹ năng",
        duration: "08:45"
    },
];

// ── DATA TIN TỨC ────────────────────────────────────────────────────────────
const NEWS = [
    {
        title: "Mưa lũ tàn phá miền Trung: Công tác cứu hộ được đẩy mạnh",
        link: "https://baochinhphu.vn/mua-lu-tan-pha-mien-trung-13-nguoi-chet-va-mat-tich-102211756.htm",
        image: "https://bcp.cdnchinhphu.vn/thumb_w/777/Uploaded/tranducmanh/2016_11_04/viewimage.aspx.jpg",
        date: "24/10/2025",
        tag: "Tin khẩn",
        tagColor: "bg-red-50 text-red-600"
    },
    {
        title: "Thực trạng lũ lụt ở Việt Nam năm 2024-2025",
        link: "https://3di.vn/thuc-trang-lu-lut-o-viet-nam-2024-2025",
        image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=500&auto=format",
        date: "15/03/2026",
        tag: "Thông báo",
        tagColor: "bg-blue-50 text-blue-600"
    },
    {
        title: "Hỗ trợ 500.000 USD giúp Việt Nam khắc phục thiên tai",
        link: "https://baochinhphu.vn/tiep-nhan-500000-usd-tu-chinh-phu-trung-quoc-ho-tro-viet-nam-khac-phuc-hau-qua-thien-tai-102251204203801983.htm",
        image: "https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2025/12/4/tiep-nhan-ung-ho-17648549630881026255749.jpg",
        date: "20/03/2026",
        tag: "Hỗ trợ",
        tagColor: "bg-emerald-50 text-emerald-600"
    },
];

// ── COMPONENT FAQ ITEM ────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`mb-3 transition-all rounded-2xl border ${open ? 'bg-white border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                <span className={`font-semibold text-slate-700 ${open ? 'text-blue-600' : ''}`}>{q}</span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-blue-500' : ''}`} />
            </button>
            {open && (
                <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed italic border-t border-slate-50 pt-4">
                    {a}
                </div>
            )}
        </div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AboutPage() {
    return (
        <div className="bg-[#FBFCFE] min-h-screen font-sans text-slate-900">

            {/* ══ HERO SECTION ═══════════════════════════════════════════════════ */}
            <section className="relative bg-white pt-24 pb-32 px-4 border-b border-slate-50 overflow-hidden text-center">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1 text-blue-600 text-xs font-bold mb-8">
                        Hoạt động 24/7
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Cùng nhau vượt qua <br />
                        <span className="text-blue-600">Mùa lũ TP. Hồ Chí Minh</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Hệ thống kết nối cứu hộ nhanh chóng, minh bạch và hoàn toàn miễn phí cho người dân.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/request-rescue" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                            <LifebuoyIcon className="h-5 w-5" /> Gửi yêu cầu SOS ngay
                        </Link>
                        <Link to="/track-rescue" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-10 py-4 rounded-2xl font-bold transition-all">
                            Tra cứu tiến độ
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══ QUY TRÌNH SECTION ═══════════════════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-4 py-32">
                <div className="grid lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 sticky top-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Quy trình <br/><span className="text-blue-600 text-4xl">5 bước</span> vận hành</h2>
                        <p className="text-slate-500 leading-relaxed">Chúng tôi tối ưu mọi công đoạn để hỗ trợ người dân nhanh nhất có thể.</p>
                    </div>
                    <div className="lg:col-span-8 space-y-10">
                        {PROCESS_STEPS.map((item, idx) => (
                            <div key={idx} className="group relative flex gap-8">
                                <div className="flex flex-col items-center">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg z-10 transition-transform group-hover:scale-105`}>
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    {idx !== PROCESS_STEPS.length - 1 && <div className="w-px h-full bg-slate-100 absolute top-14" />}
                                </div>
                                <div className="pb-8">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                    <p className="text-slate-500 text-sm mb-4 leading-relaxed">{item.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.details.map((d, i) => (
                                            <span key={i} className="text-[10px] font-bold bg-white border border-slate-100 text-slate-400 px-3 py-1.5 rounded-full uppercase">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ VIDEO SECTION (Đã thêm lại đây bạn nhé!) ═════════════════════════ */}
            <section className="py-24 bg-white border-y border-slate-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <span className="text-blue-600 font-bold uppercase text-xs tracking-widest">Truyền thông</span>
                            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-3">Thư viện Video cứu trợ</h2>
                            <p className="text-slate-500 leading-relaxed max-w-xl">Hình ảnh thực tế hiện trường và các kỹ năng sinh tồn cần thiết trong mùa lũ.</p>
                        </div>
                        <button className="text-blue-700 font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all group">
                            Xem thêm video <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {VIDEOS.map((video, i) => (
                            <div key={i} className="group">
                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-50 transition-transform group-hover:-translate-y-2">
                                    <iframe className="w-full h-full" src={video.embed} title={video.title} allowFullScreen />
                                    <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
                                        {video.category}
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between px-2">
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{video.title}</h3>
                                    <span className="text-xs font-bold text-slate-400">{video.duration}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ NEWS SECTION ════════════════════════════════════════════════════ */}
            <section className="py-24 max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">Tin tức mới nhất</h2>
                    <div className="h-1.5 w-12 bg-blue-600 mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {NEWS.map((item, i) => (
                        <a key={i} href={item.link} target="_blank" rel="noreferrer" className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                            <div className="h-56 overflow-hidden relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <span className={`absolute top-5 left-5 ${item.tagColor} px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase shadow-sm`}>{item.tag}</span>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black mb-4 uppercase">
                                    <CalendarIcon className="h-3.5 w-3.5" /> {item.date}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-6 line-clamp-2 leading-snug">{item.title}</h3>
                                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between text-blue-600 font-bold text-sm">
                                    <span>Chi tiết</span>
                                    <ArrowRightIcon className="h-4 w-4" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* ══ FAQ SECTION ═════════════════════════════════════════════════════ */}
            <section className="py-24 max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Giải đáp thắc mắc</h2>
                <FaqItem q="Dịch vụ cứu hộ này có thu phí không?" a="Không. Hệ thống cứu trợ lũ lụt TP.HCM là dịch vụ công hoàn toàn miễn phí phục vụ cộng đồng." />
                <FaqItem q="Mã Tracking Code dùng để làm gì?" a="Dùng để theo dõi trạng thái di chuyển của đội cứu hộ và gửi đánh giá sau khi bạn đã an toàn." />
            </section>

            {/* ══ FINAL CTA ═══════════════════════════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-4 pb-24 text-center">
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl shadow-blue-200">
                    <h2 className="text-3xl md:text-5xl font-black mb-8">Bạn đang cần trợ giúp?</h2>
                    <p className="text-blue-100 mb-12 max-w-xl mx-auto text-lg leading-relaxed">Hãy giữ bình tĩnh, di chuyển lên cao và nhấn nút gửi SOS ngay bên dưới.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/request-rescue" className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-xl">Gửi yêu cầu SOS</Link>
                        <a href="tel:19000000" className="flex items-center gap-4 text-white text-xl font-bold">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"><PhoneIcon className="h-6 w-6"/></div>
                            Hotline: 1900 0000
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}