import React, { useState } from 'react';
import { rescueApi } from '../../services/rescueApi';

const TrackRescuePage = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestData, setRequestData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!trackingCode.trim()) {
            setError('Vui lòng nhập mã tra cứu');
            return;
        }

        setLoading(true);
        setError('');
        setRequestData(null);

        try {
            const data = await rescueApi.trackRequest(trackingCode.trim());
            setRequestData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tìm thấy yêu cầu với mã này');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-300',
            MOVING: 'bg-purple-100 text-purple-800 border-purple-300',
            ARRIVED: 'bg-green-100 text-green-800 border-green-300',
            IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            COMPLETED: 'bg-green-100 text-green-800 border-green-300',
            CANCELLED: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusText = (status) => {
        const texts = {
            PENDING: 'Đang chờ xử lý',
            ASSIGNED: 'Đã phân công đội cứu hộ',
            MOVING: 'Đội cứu hộ đang di chuyển',
            ARRIVED: 'Đã đến hiện trường',
            IN_PROGRESS: 'Đang thực hiện cứu hộ',
            COMPLETED: 'Hoàn thành',
            CANCELLED: 'Đã hủy'
        };
        return texts[status] || status;
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white shadow-lg rounded-xl border-t-4 border-blue-600 p-6">
                <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
                    🔍 Tra Cứu Yêu Cầu Cứu Trợ
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Nhập mã tra cứu để xem tình trạng yêu cầu cứu trợ của bạn
                </p>

                {/* Form tra cứu */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã tra cứu (VD: RC123456)"
                            className="flex-1 border-2 border-gray-300 p-3 rounded-lg text-lg font-mono focus:border-blue-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {loading ? '⏳' : '🔍 Tra cứu'}
                        </button>
                    </div>
                </form>

                {/* Hiển thị lỗi */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                        <p className="text-red-700 text-center">❌ {error}</p>
                    </div>
                )}

                {/* Hiển thị kết quả */}
                {requestData && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Trạng thái */}
                        <div className={`p-4 rounded-lg border-2 ${getStatusColor(requestData.status)}`}>
                            <p className="text-sm font-semibold mb-1">Trạng thái hiện tại:</p>
                            <p className="text-2xl font-bold">{getStatusText(requestData.status)}</p>
                        </div>

                        {/* Thông tin cơ bản */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-3 text-gray-700">Thông tin yêu cầu</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="font-semibold w-32">Mã tra cứu:</span>
                                    <span className="font-mono text-red-600">{requestData.trackingCode}</span>
                                </div>
                                {requestData.title && (
                                    <div className="flex">
                                        <span className="font-semibold w-32">Tiêu đề:</span>
                                        <span>{requestData.title}</span>
                                    </div>
                                )}
                                {requestData.description && (
                                    <div className="flex">
                                        <span className="font-semibold w-32">Mô tả:</span>
                                        <span className="flex-1">{requestData.description}</span>
                                    </div>
                                )}
                                <div className="flex">
                                    <span className="font-semibold w-32">Thời gian gửi:</span>
                                    <span>{new Date(requestData.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {requestData.completedAt && (
                                    <div className="flex">
                                        <span className="font-semibold w-32">Hoàn thành:</span>
                                        <span>{new Date(requestData.completedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông tin đội cứu hộ */}
                        {requestData.assignedTeamName && (
                            <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3 text-green-700">
                                    ✅ Đội cứu hộ đã được phân công
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex">
                                        <span className="font-semibold w-32">Tên đội:</span>
                                        <span className="font-bold text-green-700">{requestData.assignedTeamName}</span>
                                    </div>
                                    {requestData.assignedTeamPhone && (
                                        <div className="flex">
                                            <span className="font-semibold w-32">Số điện thoại:</span>
                                            <a 
                                                href={`tel:${requestData.assignedTeamPhone}`}
                                                className="font-bold text-blue-600 hover:underline"
                                            >
                                                📞 {requestData.assignedTeamPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ghi chú từ điều phối viên */}
                        {requestData.coordinatorNote && (
                            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-2 text-blue-700">
                                    📝 Ghi chú từ điều phối viên
                                </h3>
                                <p className="text-gray-700 italic">{requestData.coordinatorNote}</p>
                            </div>
                        )}

                        {/* Hướng dẫn */}
                        {requestData.status === 'PENDING' && (
                            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⏳ Yêu cầu của bạn đang được xử lý. Vui lòng kiên nhẫn chờ đội cứu hộ liên hệ.
                                </p>
                            </div>
                        )}
                        {(requestData.status === 'MOVING' || requestData.status === 'ASSIGNED') && (
                            <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                                <p className="text-sm text-purple-800">
                                    🚗 Đội cứu hộ đang trên đường tới. Vui lòng giữ máy để họ có thể liên lạc.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Hướng dẫn sử dụng */}
                {!requestData && !error && (
                    <div className="text-center text-gray-500 text-sm mt-6">
                        <p>💡 Mã tra cứu được cung cấp sau khi bạn gửi yêu cầu cứu trợ</p>
                        <p className="mt-2">Vui lòng lưu giữ mã này để theo dõi tiến độ</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackRescuePage;
