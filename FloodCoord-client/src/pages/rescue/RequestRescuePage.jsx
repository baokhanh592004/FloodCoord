import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { rescueApi } from '../../services/rescueApi';

// Sửa lỗi hiển thị icon Marker của Leaflet trong React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RequestRescuePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        emergencyLevel: 'HIGH',
        peopleCount: 1,
        contactName: '',
        contactPhone: '',
        location: {
            latitude: 10.8231, // Mặc định TP.HCM
            longitude: 106.6297,
            addressText: '',
            floodDepth: 0
        },
        mediaUrls: []
    });

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // Thành phần xử lý click chuột trên bản đồ
    const MapEvents = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                updateLocation(lat, lng);
            },
        });
        return null;
    };

    // Thành phần điều khiển di chuyển bản đồ
    const ChangeView = ({ center }) => {
        const map = useMap();
        map.setView(center, 15);
        return null;
    };

    const updateLocation = async (lat, lng) => {
        setLoading(true);
        // Geocoding ngược: Tọa độ -> Địa chỉ (Sử dụng Nominatim miễn phí)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    latitude: lat,
                    longitude: lng,
                    addressText: data.display_name || ''
                }
            }));
        } catch (error) {
            console.error("Lỗi lấy địa chỉ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetGPS = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                updateLocation(position.coords.latitude, position.coords.longitude);
                alert("Đã cập nhật vị trí từ GPS của bạn!");
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await rescueApi.requestRescue(formData);
            setSuccessData(response);
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Modal hiển thị tracking code sau khi gửi thành công */}
            {successData && (
                <div 
                    className="fixed inset-0 bg-light bg-opacity-70 flex items-center justify-center" 
                    style={{ zIndex: 9999 }}
                >
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 relative">
                        <div className="text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-green-600 mb-4">
                                Gửi yêu cầu thành công!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Vui lòng lưu lại mã tra cứu này để theo dõi tình trạng cứu trợ
                            </p>
                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600 mb-2">Mã tra cứu của bạn:</p>
                                <p className="text-3xl font-bold text-red-600 tracking-wider break-all">
                                    {successData.trackingCode}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mb-6 break-all">
                                ID: {successData.requestId}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(successData.trackingCode);
                                        alert('Đã copy mã tra cứu!');
                                    }}
                                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition font-semibold"
                                >
                                    📋 Sao chép mã
                                </button>
                                <button
                                    onClick={() => navigate('/track-rescue')}
                                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition font-semibold"
                                >
                                    🔍 Tra cứu ngay
                                </button>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 w-full text-gray-600 hover:text-gray-800 text-sm py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                ← Gửi yêu cầu mới
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white shadow-lg rounded-xl border-t-4 border-red-600 flex flex-col md:flex-row gap-6 p-6">
            
            {/* Cột trái: Bản đồ */}
            <div className="w-full md:w-1/2 h-400px md:h-auto min-h-400px rounded-lg overflow-hidden border">
                <p className="text-sm font-bold text-gray-500 mb-2 italic">* Click vào bản đồ để chọn vị trí chính xác</p>
                <MapContainer 
                    center={[formData.location.latitude, formData.location.longitude]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[formData.location.latitude, formData.location.longitude]} />
                    <MapEvents />
                    <ChangeView center={[formData.location.latitude, formData.location.longitude]} />
                </MapContainer>
            </div>

            {/* Cột phải: Form */}
            <form onSubmit={handleSubmit} className="w-full md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold text-red-700 text-center">YÊU CẦU CỨU TRỢ</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold">Mức độ khẩn cấp</label>
                        <select className="w-full border p-2 rounded bg-red-50" 
                            value={formData.emergencyLevel}
                            onChange={e => setFormData({...formData, emergencyLevel: e.target.value})}>
                            <option value="CRITICAL">Nguy kịch</option>
                            <option value="HIGH">Cao</option>
                            <option value="NORMAL">Bình thường</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold">Số người bị nạn</label>
                        <input type="number" className="w-full border p-2 rounded" 
                            value={formData.peopleCount}
                            onChange={e => setFormData({...formData, peopleCount: parseInt(e.target.value)})} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold">Địa chỉ hiện tại</label>
                    <textarea 
                        className="w-full border p-2 rounded text-sm bg-gray-50" 
                        rows="2"
                        value={formData.location.addressText}
                        onChange={e => setFormData({...formData, location: {...formData.location, addressText: e.target.value}})}
                        placeholder="Địa chỉ tự động lấy từ bản đồ..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-red-600">Họ tên người liên hệ *</label>
                    <input 
                        type="text" 
                        className="w-full border p-2 rounded" 
                        value={formData.contactName}
                        onChange={e => setFormData({...formData, contactName: e.target.value})} 
                        placeholder="Nhập họ tên của bạn"
                        required 
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-red-600">Số điện thoại liên hệ *</label>
                    <input 
                        type="tel" 
                        className="w-full border p-2 rounded" 
                        value={formData.contactPhone}
                        onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                        placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx"
                        pattern="^(0|\+84)[0-9]{9}$"
                        required 
                    />
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={handleGetGPS} className="flex-1 bg-blue-600 text-white p-2 rounded text-sm font-bold hover:bg-blue-800 transition">
                        📍 GPS Hiện Tại
                    </button>
                    <div className="flex-1 text-xs text-gray-500">
                        Lat: {formData.location.latitude.toFixed(4)}<br/>
                        Lng: {formData.location.longitude.toFixed(4)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold">Tiêu đề</label>
                    <input type="text" className="w-full border p-2 rounded" 
                        onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>

                <div>
                    <label className="block text-sm font-semibold">Mô tả chi tiết tình hình</label>
                    <textarea className="w-full border p-2 rounded" rows="3"
                        onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>

                <button type="submit" disabled={loading}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:bg-gray-400">
                    {loading ? "ĐANG XỬ LÝ..." : "🚨 GỬI CỨU TRỢ NGAY"}
                </button>

                <p className="text-xs text-center text-gray-500">
                    * Bạn không cần đăng nhập. Sau khi gửi, bạn sẽ nhận được mã để tra cứu tình trạng
                </p>
            </form>
            </div>
            </div>
        </>
    );
};

export default RequestRescuePage;