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
} from '@heroicons/react/24/outline';

// ── Dữ liệu quy trình ─────────────────────────────────────────────────────────
const PROCESS_STEPS = [
    {
        step: '01',
        icon: ShieldExclamationIcon,
        color: 'from-red-500 to-orange-500',
        bgLight: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Người dân gửi yêu cầu SOS',
        description:
            'Khi gặp tình huống khẩn cấp do lũ lụt, người dân truy cập hệ thống và điền thông tin yêu cầu cứu hộ. Hệ thống tự động cấp mã tra cứu (Tracking Code) để theo dõi tiến độ.',
        details: [
            'Không cần đăng nhập — ai cũng có thể gửi yêu cầu',
            'Cung cấp vị trí, mô tả tình huống và mức độ khẩn cấp',
            'Nhận mã tra cứu ngay sau khi gửi thành công',
        ],
        action: { label: 'Gửi yêu cầu ngay', href: '/request-rescue' },
    },
    {
        step: '02',
        icon: ClipboardDocumentCheckIcon,
        color: 'from-blue-500 to-cyan-500',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Điều phối viên tiếp nhận & xác minh',
        description:
            'Điều phối viên xem xét yêu cầu, đánh giá mức độ ưu tiên và xác minh thông tin. Các yêu cầu hợp lệ sẽ được chuyển sang trạng thái "Đã xác minh" để tiến hành phân công.',
        details: [
            'Hệ thống hiển thị hàng đợi yêu cầu theo mức độ ưu tiên',
            'Điều phối viên kiểm tra và xác minh thông tin người dân',
            'Ghi chú tiến độ để người dân có thể theo dõi',
        ],
    },
    {
        step: '03',
        icon: TruckIcon,
        color: 'from-purple-500 to-indigo-500',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200',
        title: 'Phân công đội cứu hộ & phương tiện',
        description:
            'Điều phối viên chỉ định đội cứu hộ phù hợp cùng phương tiện (tàu, xe, trực thăng…) và vật tư cần thiết. Đội cứu hộ nhận thông tin nhiệm vụ ngay lập tức.',
        details: [
            'Chọn đội sẵn sàng, không đang thực hiện nhiệm vụ khác',
            'Cấp phát phương tiện phù hợp với địa hình lũ lụt',
            'Đính kèm danh sách vật tư cứu trợ cần mang theo',
        ],
    },
    {
        step: '04',
        icon: UserGroupIcon,
        color: 'from-teal-500 to-green-500',
        bgLight: 'bg-teal-50',
        borderColor: 'border-teal-200',
        title: 'Đội cứu hộ thực hiện nhiệm vụ',
        description:
            'Đội cứu hộ nhận nhiệm vụ qua hệ thống, cập nhật trạng thái theo từng giai đoạn: Di chuyển → Đã đến → Đang cứu hộ. Người dân có thể theo dõi tiến độ thời gian thực.',
        details: [
            'Trưởng đội cập nhật trạng thái: Đang di chuyển / Đã đến / Hoàn thành',
            'Người dân tra cứu bằng mã Tracking Code',
            'Thông tin đội cứu hộ (tên, số điện thoại) hiển thị để liên lạc',
        ],
    },
    {
        step: '05',
        icon: CheckCircleIcon,
        color: 'from-green-500 to-emerald-500',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Hoàn thành & Người dân đánh giá',
        description:
            'Sau khi nhiệm vụ kết thúc, người dân xác nhận hoàn thành và gửi đánh giá chất lượng dịch vụ. Phương tiện và đội cứu hộ được giải phóng để sẵn sàng cho nhiệm vụ tiếp theo.',
        details: [
            'Gửi lời cảm ơn hoặc góp ý qua trang Tra cứu',
            'Chấm điểm từ 1 đến 5 sao cho đội cứu hộ',
            'Phương tiện & đội tự động chuyển về trạng thái Sẵn sàng',
        ],
        action: { label: 'Tra cứu yêu cầu', href: '/track-rescue' },
    },
];

// ── Vai trò trong hệ thống ─────────────────────────────────────────────────────
const ROLES = [
    {
        emoji: '👨‍👩‍👧',
        title: 'Người dân',
        color: 'bg-orange-50 border-orange-200',
        titleColor: 'text-orange-700',
        items: [
            'Gửi yêu cầu cứu hộ khẩn cấp',
            'Tra cứu tình trạng bằng mã code',
            'Xem thông tin đội được phân công',
            'Gửi đánh giá sau khi hoàn thành',
        ],
    },
    {
        emoji: '🎯',
        title: 'Điều phối viên',
        color: 'bg-blue-50 border-blue-200',
        titleColor: 'text-blue-700',
        items: [
            'Tiếp nhận và xác minh yêu cầu',
            'Phân công đội & phương tiện',
            'Theo dõi tiến độ tất cả nhiệm vụ',
            'Ghi chú cập nhật cho người dân',
        ],
    },
    {
        emoji: '🏗️',
        title: 'Quản lý',
        color: 'bg-purple-50 border-purple-200',
        titleColor: 'text-purple-700',
        items: [
            'Quản lý kho phương tiện cứu hộ',
            'Quản lý đội cứu hộ & nhân sự',
            'Quản lý kho vật tư cứu trợ',
            'Xuất báo cáo tồn kho Excel',
        ],
    },
    {
        emoji: '🚒',
        title: 'Đội cứu hộ',
        color: 'bg-teal-50 border-teal-200',
        titleColor: 'text-teal-700',
        items: [
            'Nhận nhiệm vụ được giao',
            'Cập nhật trạng thái theo giai đoạn',
            'Xem bản đồ nhiệm vụ',
            'Báo cáo kết quả hoàn thành',
        ],
    },
];

// ── FAQ ────────────────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: 'Tôi có cần đăng ký tài khoản để gửi yêu cầu cứu hộ không?',
        a: 'Không. Hệ thống cho phép bất kỳ ai gửi yêu cầu cứu hộ mà không cần tài khoản. Bạn chỉ cần điền thông tin vị trí và mô tả tình huống.',
    },
    {
        q: 'Mã tra cứu (Tracking Code) là gì và dùng để làm gì?',
        a: 'Mã tra cứu là mã duy nhất được cấp sau khi bạn gửi yêu cầu thành công. Dùng mã này tại trang "Tra cứu cứu hộ" để xem trạng thái yêu cầu, thông tin đội cứu hộ và gửi đánh giá sau khi hoàn thành.',
    },
    {
        q: 'Mất bao lâu để đội cứu hộ đến nơi?',
        a: 'Thời gian phụ thuộc vào khoảng cách, điều kiện lũ lụt và số lượng đội sẵn sàng. Hệ thống ưu tiên phân công theo mức độ khẩn cấp. Bạn có thể theo dõi trạng thái "Đang di chuyển" trong thời gian thực.',
    },
    {
        q: 'Tôi có thể liên lạc trực tiếp với đội cứu hộ không?',
        a: 'Có. Sau khi đội cứu hộ được phân công, số điện thoại của đội trưởng sẽ hiển thị tại trang Tra cứu để bạn liên lạc trực tiếp khi cần.',
    },
    {
        q: 'Hệ thống hỗ trợ những loại phương tiện cứu hộ nào?',
        a: 'Hệ thống quản lý đa dạng phương tiện: Tàu / Cano (dành cho vùng ngập sâu), Xe tải, Xe cứu hộ, Xe cấp cứu và Trực thăng. Điều phối viên sẽ chọn phương tiện phù hợp với địa hình.',
    },
];

// ── Component FAQ Item ─────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-blue-300 shadow-sm' : 'border-gray-200'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-800 text-sm pr-4">{q}</span>
                {open
                    ? <ChevronUpIcon className="h-4 w-4 text-blue-500 shrink-0" />
                    : <ChevronDownIcon className="h-4 w-4 text-gray-400 shrink-0" />
                }
            </button>
            {open && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-blue-50/30">
                    {a}
                </div>
            )}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AboutPage() {
    return (
        <div className="bg-gray-50 min-h-screen">

            {/* ══ HERO ══════════════════════════════════════════════════════════ */}
            <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Hệ thống đang hoạt động 24/7
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Trung tâm Cứu trợ<br />
                        <span className="text-teal-200">Lũ lụt TP.HCM</span>
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Hệ thống điều phối cứu hộ khẩn cấp — kết nối người dân với đội cứu hộ chuyên nghiệp
                        một cách nhanh chóng, minh bạch và hiệu quả.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/request-rescue"
                            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg"
                        >
                            <ShieldExclamationIcon className="h-5 w-5" />
                            Gửi yêu cầu SOS
                        </Link>
                        <Link
                            to="/track-rescue"
                            className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition border border-white/40"
                        >
                            <ClipboardDocumentCheckIcon className="h-5 w-5" />
                            Tra cứu yêu cầu
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══ THỐNG KÊ NHANH ════════════════════════════════════════════════ */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { value: '24/7', label: 'Hoạt động liên tục' },
                        { value: '5',    label: 'Loại phương tiện' },
                        { value: '4',    label: 'Vai trò trong hệ thống' },
                        { value: '0đ',   label: 'Hoàn toàn miễn phí' },
                    ].map(({ value, label }) => (
                        <div key={label}>
                            <p className="text-3xl font-extrabold text-blue-600">{value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ QUY TRÌNH HOẠT ĐỘNG ══════════════════════════════════════════ */}
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Quy trình hoạt động</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Từ lúc người dân gửi SOS đến khi nhiệm vụ hoàn thành — tất cả được theo dõi minh bạch trên một nền tảng.
                    </p>
                </div>

                <div className="relative">
                    {/* Đường kết nối dọc */}
                    <div className="hidden md:block absolute left-[38px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-red-300 via-blue-300 via-purple-300 via-teal-300 to-green-300" />

                    <div className="space-y-6">
                        {PROCESS_STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={idx} className={`relative flex gap-5 p-5 rounded-2xl border ${step.borderColor} ${step.bgLight} transition-all hover:shadow-md`}>
                                    {/* Icon bước */}
                                    <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold text-gray-400 tracking-widest">BƯỚC {step.step}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
                                        <ul className="space-y-1">
                                            {step.details.map((d, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                        {step.action && (
                                            <Link
                                                to={step.action.href}
                                                className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r ${step.color} text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition shadow`}
                                            >
                                                {step.action.label} →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ TẠI SAO CHỌN HỆ THỐNG NÀY ══════════════════════════════════ */}
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Tại sao chọn hệ thống này?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            emoji: '⚡',
                            title: 'Phản hồi nhanh',
                            desc: 'Yêu cầu được tiếp nhận tức thì và phân công ngay lập tức không qua trung gian.',
                        },
                        {
                            emoji: '🔍',
                            title: 'Theo dõi minh bạch',
                            desc: 'Người dân tra cứu tiến độ mọi lúc bằng mã code — không cần lo lắng hay hỏi qua điện thoại.',
                        },
                        {
                            emoji: '🛡️',
                            title: 'An toàn & Bảo mật',
                            desc: 'Dữ liệu được bảo vệ. Thông tin cá nhân chỉ dùng để điều phối cứu hộ.',
                        },
                        {
                            emoji: '📱',
                            title: 'Dễ sử dụng',
                            desc: 'Giao diện đơn giản, tối ưu cho điện thoại — phù hợp cho mọi lứa tuổi trong tình huống khẩn cấp.',
                        },
                        {
                            emoji: '🚨',
                            title: 'Hoạt động 24/7',
                            desc: 'Hệ thống luôn trực tuyến. Yêu cầu cứu hộ có thể gửi bất kỳ lúc nào, kể cả lúc nửa đêm.',
                        },
                        {
                            emoji: '💚',
                            title: 'Hoàn toàn miễn phí',
                            desc: 'Không thu bất kỳ khoản phí nào. Đây là dịch vụ công phục vụ cộng đồng.',
                        },
                    ].map(({ emoji, title, desc }) => (
                        <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
                            <div className="text-3xl mb-3">{emoji}</div>
                            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ FAQ ══════════════════════════════════════════════════════════ */}
            <section className="bg-white border-y border-gray-200 py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Câu hỏi thường gặp</h2>
                        <p className="text-gray-500">Giải đáp nhanh những thắc mắc phổ biến nhất</p>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <FaqItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ LIÊN HỆ & CTA ════════════════════════════════════════════════ */}
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
                    <StarIcon className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Cần hỗ trợ khẩn cấp?</h2>
                    <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                        Đừng chần chừ — gửi yêu cầu ngay hoặc gọi đường dây nóng để được hỗ trợ kịp thời.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                        <Link
                            to="/request-rescue"
                            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg text-sm"
                        >
                            <ShieldExclamationIcon className="h-5 w-5" />
                            Gửi yêu cầu SOS ngay
                        </Link>
                        <a
                            href="tel:113"
                            className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition border border-white/40 text-sm"
                        >
                            <PhoneIcon className="h-5 w-5" />
                            Gọi Hotline: 113
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-100">
                        <div className="flex items-center justify-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-teal-200" />
                            <span>Hotline: <strong className="text-white">113</strong></span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <EnvelopeIcon className="h-4 w-4 text-teal-200" />
                            <span>Email: <strong className="text-white">cuutro@tphcm.gov.vn</strong></span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-teal-200" />
                            <span>TP. Hồ Chí Minh</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
