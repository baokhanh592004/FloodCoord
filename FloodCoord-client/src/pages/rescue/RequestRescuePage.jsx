import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        emergencyLevel: 'HIGH',
        peopleCount: 1,
        location: {
            latitude: 10.8231, // Mặc định TP.HCM
            longitude: 106.6297,
            addressText: '',
            floodDepth: 0
        },
        mediaUrls: []
    });

    const [loading, setLoading] = useState(false);

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
            await rescueApi.requestRescue(formData);
            alert("Gửi cứu trợ thành công!");
        } catch (error) {
            alert("Lỗi: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl border-t-4 border-red-600 flex flex-col md:flex-row gap-6">
            
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
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
                    {loading ? "ĐANG XỬ LÝ..." : "GỬI CỨU TRỢ NGAY"}
                </button>
            </form>
        </div>
    );
};

export default RequestRescuePage;