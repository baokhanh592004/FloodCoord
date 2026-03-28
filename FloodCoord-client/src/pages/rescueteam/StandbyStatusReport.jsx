import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { incidentReportApi } from '../../services/incidentReportApi';

/**
 * Màn hình đội gửi báo cáo tình trạng xe + vật tư sau khi bị đặt OFF_DUTY
 * (Post-departure incident resolution).
 *
 * Route: /rescue-team/missions/:id/standby-report
 *
 * Reuses the existing IncidentReport creation API — gửi báo cáo mới
 * với tiêu đề bắt đầu bằng "[STATUS_REPORT]" để coordinator phân biệt.
 *
 * Sau khi coordinator duyệt báo cáo + kiểm tra xe xong, họ sẽ thủ công
 * cập nhật trạng thái đội và xe từ trang quản lý.
 */
export default function StandbyStatusReport() {
    const { id: rescueRequestId } = useParams();
    const navigate = useNavigate();

    const [vehicleCondition, setVehicleCondition] = useState('');
    const [supplyNotes, setSupplyNotes] = useState('');
    const [locationNote, setLocationNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vehicleCondition.trim()) {
            setError('Vui lòng nhập tình trạng xe.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const description = [
                `📍 Vị trí hiện tại: ${locationNote.trim() || 'Không rõ'}`,
                `🚗 Tình trạng xe: ${vehicleCondition.trim()}`,
                `📦 Tình trạng vật tư: ${supplyNotes.trim() || 'Không có ghi chú thêm'}`,
            ].join('\n\n');

            await incidentReportApi.createIncident(rescueRequestId, {
                title: `[STATUS_REPORT] Báo cáo tình trạng sau sự cố`,
                description,
                images: [],
            });

            setSubmitted(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="p-8 max-w-xl mx-auto">
                <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-8 text-center space-y-4">
                    <div className="text-5xl">✅</div>
                    <h2 className="text-xl font-black text-green-900">Báo cáo đã được gửi!</h2>
                    <p className="text-sm text-green-700">
                        Coordinator đã nhận được báo cáo tình trạng của đội bạn.
                        <br />
                        Họ sẽ cập nhật trạng thái đội và xe sau khi kiểm tra.
                    </p>
                    <button
                        onClick={() => navigate('/rescue-team/missions')}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all active:scale-95"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-xl mx-auto space-y-4">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                >
                    ← Quay lại
                </button>
                <h1 className="text-2xl font-black text-gray-900">📋 Báo cáo tình trạng</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gửi báo cáo về tình trạng xe và vật tư sau khi sự cố xảy ra.
                    Coordinator sẽ dùng thông tin này để cập nhật hệ thống.
                </p>
            </div>

            {/* Notice */}
            <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-800">
                <strong>Lưu ý:</strong> Đội bạn đang ở trạng thái <strong>nghỉ trực (OFF_DUTY)</strong>.
                Xe đang trong chế độ bảo trì. Vật tư đã mang đi không được hoàn lại kho.
                Báo cáo này giúp Coordinator biết khi nào đội và xe đã sẵn sàng hoạt động trở lại.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Vehicle condition */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Tình trạng xe <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={vehicleCondition}
                        onChange={(e) => setVehicleCondition(e.target.value)}
                        rows={3}
                        placeholder="VD: Xe bị thủng lốp, đã dừng ở km 12 đường Lê Lợi. Cần thay lốp và kiểm tra gầm..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none resize-none"
                    />
                </div>

                {/* Supply notes */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Tình trạng vật tư đã mang theo
                    </label>
                    <textarea
                        value={supplyNotes}
                        onChange={(e) => setSupplyNotes(e.target.value)}
                        rows={3}
                        placeholder="VD: Đã phân phát 5 thùng mì, 2 can nước. Còn lại: 3 bộ kit y tế chưa dùng (để trên xe)..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none resize-none"
                    />
                </div>

                {/* Current location */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Vị trí hiện tại của đội / xe
                    </label>
                    <input
                        type="text"
                        value={locationNote}
                        onChange={(e) => setLocationNote(e.target.value)}
                        placeholder="VD: Đường Trần Phú, phường 3, TP. Cà Mau"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    />
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95"
                >
                    {submitting ? 'Đang gửi...' : '📤 Gửi báo cáo tình trạng'}
                </button>
            </form>
        </div>
    );
}
