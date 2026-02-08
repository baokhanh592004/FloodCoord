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
        emergencyLevel: 'CRITICAL',
        peopleCount: 1,
        contactName: '',
        contactPhone: '',
        location: {
            latitude: 10.8231, // Mặc định TP.HCM
            longitude: 106.6297,
            addressText: '',
            floodDepth: 0
        }
    });

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(false);

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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/avi', 'video/mov'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const validFiles = files.filter(file => {
            if (!validTypes.includes(file.type)) {
                alert(`File ${file.name} không hợp lệ. Chỉ chấp nhận ảnh (JPG, PNG) và video (MP4, AVI, MOV)`);
                return false;
            }
            if (file.size > maxSize) {
                alert(`File ${file.name} quá lớn. Kích thước tối đa là 10MB`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'floodcoord'); // Thay bằng upload preset của bạn
        
        const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
        const cloudName = 'YOUR_CLOUD_NAME'; // Thay bằng cloud name của bạn
        
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            const data = await response.json();
            return {
                mediaType: resourceType.toUpperCase(),
                mediaUrl: data.secure_url
            };
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(true);
        
        try {
            // Upload files nếu có
            let uploadedMedia = [];
            if (selectedFiles.length > 0) {
                uploadedMedia = await Promise.all(
                    selectedFiles.map(file => uploadToCloudinary(file))
                );
            }

            // Gửi request với media URLs
            const requestData = {
                ...formData,
                media: uploadedMedia
            };
            
            const response = await rescueApi.requestRescue(requestData);
            setSuccessData(response);
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
            setUploadProgress(false);
        }
    };

    return (
        <>
            {/* Modal hiển thị tracking code sau khi gửi thành công */}
            {successData && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center" 
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

            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            
                            {/* Cột trái: Bản đồ */}
                            <div className="relative h-[400px] lg:h-auto lg:min-h-[900px]">
                                {/* Pin Location Tooltip */}
                                <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg p-4 max-w-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">Đánh dấu vị trí</h3>
                                            <p className="text-sm text-gray-600">
                                                Click vào bản đồ để chọn vị trí chính xác cho đội cứu hộ.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Container */}
                                <MapContainer 
                                    center={[formData.location.latitude, formData.location.longitude]} 
                                    zoom={13} 
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[formData.location.latitude, formData.location.longitude]} />
                                    <MapEvents />
                                    <ChangeView center={[formData.location.latitude, formData.location.longitude]} />
                                </MapContainer>

                                {/* GPS Button */}
                                <button 
                                    type="button"
                                    onClick={handleGetGPS} 
                                    className="absolute bottom-6 left-6 z-[1000] bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-5 rounded-full shadow-lg border-2 border-gray-200 flex items-center gap-2 transition-all hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Dùng GPS của tôi
                                </button>

                                
                            </div>

                            {/* Cột phải: Form */}
                            <div className="p-6 lg:p-8 overflow-y-auto lg:max-h-[900px]">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-6">
                                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">Yêu Cầu Cứu Trợ Khẩn Cấp</h1>
                                            <p className="text-gray-600 mt-1">
                                                Vui lòng điền thông tin chi tiết để được hỗ trợ nhanh nhất.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Emergency Level */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                                            <label className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                                                Mức độ khẩn cấp
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({...formData, emergencyLevel: 'CRITICAL'})}
                                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                                    formData.emergencyLevel === 'CRITICAL'
                                                        ? 'border-red-600 bg-red-50 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-red-300'
                                                }`}
                                            >
                                                {formData.emergencyLevel === 'CRITICAL' && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="text-3xl mb-2">🚨</div>
                                                <div className="font-bold text-gray-900">Nguy kịch</div>
                                                <div className="text-xs text-red-600 mt-1">Đe dọa tính mạng</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setFormData({...formData, emergencyLevel: 'HIGH'})}
                                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                                    formData.emergencyLevel === 'HIGH'
                                                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-orange-300'
                                                }`}
                                            >
                                                {formData.emergencyLevel === 'HIGH' && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="text-3xl mb-2">⚠️</div>
                                                <div className="font-bold text-gray-900">Cao</div>
                                                <div className="text-xs text-orange-600 mt-1">Cần hỗ trợ ngay</div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setFormData({...formData, emergencyLevel: 'NORMAL'})}
                                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                                    formData.emergencyLevel === 'NORMAL'
                                                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                                }`}
                                            >
                                                {formData.emergencyLevel === 'NORMAL' && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="text-3xl mb-2">ℹ️</div>
                                                <div className="font-bold text-gray-900">Bình thường</div>
                                                <div className="text-xs text-blue-600 mt-1">An toàn/Ổn định</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
                                            <label className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                                                Thông tin liên hệ
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Họ và tên
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition" 
                                                    value={formData.contactName}
                                                    onChange={e => setFormData({...formData, contactName: e.target.value})} 
                                                    placeholder="VD: Nguyễn Văn A"
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Số điện thoại
                                                </label>
                                                <input 
                                                    type="tel" 
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition" 
                                                    value={formData.contactPhone}
                                                    onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                                                    placeholder="VD: 0912345678"
                                                    pattern="^(0|\+84)[0-9]{9}$"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Situation Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
                                            <label className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                                                Chi tiết tình huống
                                            </label>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tiêu đề
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition" 
                                                    value={formData.title}
                                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                                    placeholder="VD: Bị mắc kẹt trên mái nhà"
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Số người bị nạn
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({...formData, peopleCount: Math.max(1, formData.peopleCount - 1)})}
                                                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-xl font-bold transition"
                                                    >
                                                        −
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-lg focus:border-blue-500 focus:outline-none transition" 
                                                        value={formData.peopleCount}
                                                        onChange={e => setFormData({...formData, peopleCount: Math.max(1, parseInt(e.target.value) || 1)})}
                                                        min="1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({...formData, peopleCount: formData.peopleCount + 1})}
                                                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-xl font-bold transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mô tả chi tiết
                                            </label>
                                            <textarea 
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition" 
                                                rows="4"
                                                value={formData.description}
                                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                                placeholder="Mô tả tình hình, nhu cầu y tế, hoặc nguy hiểm..."
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Location Info (Hidden but auto-filled) */}
                                    {formData.location.addressText && (
                                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-1">
                                                    <div className="font-medium text-blue-900 text-sm mb-1">Vị trí đã chọn:</div>
                                                    <div className="text-sm text-blue-800">{formData.location.addressText}</div>
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Evidence Upload */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-5 bg-gray-800 rounded-full"></div>
                                            <label className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                                                Bằng chứng (Tùy chọn)
                                            </label>
                                        </div>
                                        
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/jpg,video/mp4,video/avi,video/mov"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className="cursor-pointer">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="font-medium text-gray-700 mb-1">Tải lên hình ảnh hoặc video</p>
                                                <p className="text-sm text-gray-500">JPG, PNG, MP4, AVI, MOV (Tối đa 10MB)</p>
                                            </label>
                                        </div>
                                        
                                        {/* File Preview */}
                                        {selectedFiles.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                {selectedFiles.map((file, index) => {
                                                    const previewUrl = URL.createObjectURL(file);
                                                    const isVideo = file.type.startsWith('video/');

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="relative border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
                                                        >
                                                            {/* Preview */}
                                                            {isVideo ? (
                                                                <video
                                                                    src={previewUrl}
                                                                    controls
                                                                    className="w-full h-32 object-cover"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={previewUrl}
                                                                    alt={file.name}
                                                                    className="w-full h-32 object-cover"
                                                                />
                                                            )}

                                                            {/* Info */}
                                                            <div className="p-2 text-xs bg-gray-50">
                                                                <p className="truncate font-medium text-gray-800">{file.name}</p>
                                                                <p className="text-gray-500">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>

                                                            {/* Remove button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    URL.revokeObjectURL(previewUrl);
                                                                    removeFile(index);
                                                                }}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg transition"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                    >
                                        {uploadProgress ? (
                                            <>
                                                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                ĐANG TẢI FILE...
                                            </>
                                        ) : loading ? (
                                            <>
                                                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                ĐANG XỬ LÝ...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                GỬI YÊU CẦU KHẨN CẤP
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-center text-gray-500">
                                        * Bạn không cần đăng nhập. Sau khi gửi, bạn sẽ nhận được mã tra cứu để theo dõi tình trạng cứu trợ.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RequestRescuePage;
