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
    const [locationConfirmed, setLocationConfirmed] = useState(false);
    const [addressNote, setAddressNote] = useState(''); // Ghi chú thêm (số nhà, hẻm, tầng...)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [formErrors, setFormErrors] = useState({});

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
        setLocationConfirmed(false); // Reset confirmation on new location pick
        if (formErrors.location) setFormErrors(prev => ({...prev, location: ''}));
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

    // Tìm kiếm địa chỉ bằng text (Nominatim forward geocoding)
    const searchAddress = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=vn`
            );
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error('Lỗi tìm kiếm địa chỉ', err);
        } finally {
            setSearching(false);
        }
    };

    const selectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                latitude: lat,
                longitude: lng,
                addressText: result.display_name
            }
        }));
        setSearchResults([]);
        setSearchQuery('');
        setLocationConfirmed(false);
    };

    const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            alert(`File ${file.name} không hợp lệ.`);
            return false;
        }

        if (isImage && file.size > 5 * 1024 * 1024) {
            alert(`Ảnh ${file.name} phải <= 5MB`);
            return false;
        }

        if (isVideo && file.size > 25 * 1024 * 1024) {
            alert(`Video ${file.name} phải <= 25MB`);
            return false;
        }

        return true;
    });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    

   const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validate tất cả các trường bắt buộc ---
    const errors = {};

    if (!formData.contactName.trim()) {
        errors.contactName = 'Vui lòng nhập họ và tên của bạn.';
    }

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!formData.contactPhone.trim()) {
        errors.contactPhone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(formData.contactPhone.trim())) {
        errors.contactPhone = 'Số điện thoại không đúng định dạng (VD: 0912345678).';
    }

    if (!formData.location.addressText.trim()) {
        errors.location = 'Vui lòng chọn hoặc tìm kiếm địa điểm cần cứu hộ.';
    } else if (!locationConfirmed) {
        errors.location = 'Vui lòng nhấn "Xác nhận đây là địa điểm cần cứu hộ" trước khi gửi.';
    }

    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        // Cuộn lên trường lỗi đầu tiên
        const firstErrorKey = Object.keys(errors)[0];
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    setFormErrors({});

    if (selectedFiles.length === 0) {
        if (!window.confirm("Bạn chưa đính kèm bằng chứng. Vẫn gửi?")) return;
    }

    setLoading(true);
    setUploadProgress(true);

    try {
        const form = new FormData();

        form.append("title", formData.title);
        form.append("description", formData.description);
        form.append("emergencyLevel", formData.emergencyLevel);
        form.append("peopleCount", formData.peopleCount);
        form.append("contactName", formData.contactName);
        form.append("contactPhone", formData.contactPhone);

        form.append("location.latitude", formData.location.latitude);
        form.append("location.longitude", formData.location.longitude);
        // Ghép ghi chú thêm vào địa chỉ nếu có
        const fullAddress = addressNote.trim()
            ? `${formData.location.addressText} (${addressNote.trim()})`
            : formData.location.addressText;
        form.append("location.addressText", fullAddress);
        form.append("location.floodDepth", formData.location.floodDepth);

        selectedFiles.forEach(file => {
            form.append("files", file);
        });

        const response = await rescueApi.requestRescue(form);
        const responseData = response.data || response;

        setSuccessData(responseData);

        if (responseData && responseData.trackingCode) {
            const existingCodes = JSON.parse(localStorage.getItem('guestTrackingCodes') || '[]');
            if (!existingCodes.includes(responseData.trackingCode)) {
                existingCodes.push(responseData.trackingCode);
                localStorage.setItem('guestTrackingCodes', JSON.stringify(existingCodes));
            }
        }

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Upload thất bại");
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
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 9999, background: 'rgba(240, 253, 244, 0.85)', backdropFilter: 'blur(6px)' }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header xanh lá */}
                        <div className="bg-linear-to-br from-green-500 to-emerald-600 px-6 pt-8 pb-6 text-center">
                            {/* Icon check circle */}
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Gửi thành công!</h2>
                            <p className="text-green-100 text-sm">Yêu cầu cứu hộ của bạn đã được tiếp nhận</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Mã tra cứu */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 text-center">
                                    🔑 Mã tra cứu của bạn:
                                </p>
                                <p className="text-3xl font-bold text-gray-900 tracking-widest text-center break-all">
                                    {successData.trackingCode}
                                </p>
                                <p className="text-xs text-gray-400 text-center mt-2">
                                    Lưu lại mã này để theo dõi tình trạng cứu trợ
                                </p>
                            </div>

                            {/* Info */}
                            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Đội điều phối sẽ xem xét và phân công đội cứu hộ đến hỗ trợ bạn. Vui lòng giữ điện thoại để nhận liên lạc.
                                </p>
                            </div>

                            {/* ID nhỏ */}
                            <p className="text-[11px] text-gray-400 text-center break-all">
                                Mã yêu cầu: {successData.requestId}
                            </p>
                        </div>

                        {/* Footer buttons */}
                        <div className="px-6 pb-6 space-y-2">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(successData.trackingCode);
                                        alert('Đã copy mã tra cứu!');
                                    }}
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Sao chép mã
                                </button>
                                <button
                                    onClick={() => navigate('/track-rescue')}
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Tra cứu ngay
                                </button>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition font-medium"
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
                            <div className="relative h-100 lg:h-auto lg:min-h-225">
                                {/* Pin Location Tooltip */}
                                <div className="absolute top-4 left-4 z-1000 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1">Bước 1: Chọn vị trí</h3>
                                            <p className="text-sm text-gray-600">
                                                Click vào bản đồ để ghim vị trí, sau đó <strong>xác nhận địa điểm</strong> trong form bên phải.
                                            </p>
                                            {locationConfirmed && (
                                                <div className="mt-2 flex items-center gap-1 text-green-700 text-xs font-semibold">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Địa điểm đã xác nhận
                                                </div>
                                            )}
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
                                    className="absolute bottom-6 left-6 z-1000 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-5 rounded-full shadow-lg border-2 border-gray-200 flex items-center gap-2 transition-all hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Dùng GPS của tôi
                                </button>

                                
                            </div>

                            {/* Cột phải: Form */}
                            <div className="p-6 lg:p-8 overflow-y-auto lg:max-h-225">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-6">
                                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
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
                                            <div id="field-contactName">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Họ và tên <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                                                        formErrors.contactName
                                                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                                                            : 'border-gray-200 focus:border-blue-500'
                                                    }`}
                                                    value={formData.contactName}
                                                    onChange={e => {
                                                        setFormData({...formData, contactName: e.target.value});
                                                        if (formErrors.contactName) setFormErrors(prev => ({...prev, contactName: ''}));
                                                    }}
                                                    placeholder="VD: Nguyễn Văn A"
                                                />
                                                {formErrors.contactName && (
                                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.contactName}
                                                    </p>
                                                )}
                                            </div>
                                            <div id="field-contactPhone">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="tel" 
                                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                                                        formErrors.contactPhone
                                                            ? 'border-red-400 bg-red-50 focus:border-red-500'
                                                            : 'border-gray-200 focus:border-blue-500'
                                                    }`}
                                                    value={formData.contactPhone}
                                                    onChange={e => {
                                                        setFormData({...formData, contactPhone: e.target.value});
                                                        if (formErrors.contactPhone) setFormErrors(prev => ({...prev, contactPhone: ''}));
                                                    }}
                                                    placeholder="VD: 0912345678"
                                                />
                                                {formErrors.contactPhone && (
                                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {formErrors.contactPhone}
                                                    </p>
                                                )}
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

                                    {/* Location Confirmation Panel */}
                                    <div id="field-location">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-1 h-5 rounded-full ${formErrors.location ? 'bg-red-500' : 'bg-red-600'}`}></div>
                                            <label className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                                                Xác nhận địa điểm cứu hộ <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                        {formErrors.location && (
                                            <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-300 rounded-xl px-4 py-3">
                                                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm text-red-700 font-medium">{formErrors.location}</p>
                                            </div>
                                        )}

                                        {!formData.location.addressText ? (
                                            <div className="space-y-3">
                                                {/* Search box */}
                                                <div className="relative">
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={e => setSearchQuery(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                                                                placeholder="🔍 Tìm kiếm địa chỉ... VD: 123 Nguyễn Huệ, Q.1"
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition pr-10"
                                                            />
                                                            {searchQuery && (
                                                                <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={searchAddress}
                                                            disabled={searching || !searchQuery.trim()}
                                                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition flex items-center gap-2 whitespace-nowrap"
                                                        >
                                                            {searching ? (
                                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                </svg>
                                                            )}
                                                            Tìm
                                                        </button>
                                                    </div>

                                                    {/* Search results dropdown */}
                                                    {searchResults.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                                            {searchResults.map((r, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => selectSearchResult(r)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="text-blue-500 mt-0.5 shrink-0">📍</span>
                                                                        <span className="text-sm text-gray-800 leading-snug">{r.display_name}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {searching === false && searchQuery && searchResults.length === 0 && !searching && (
                                                        <p className="text-xs text-gray-400 mt-1 px-1">Không tìm thấy. Thử tìm cụ thể hơn hoặc click thẳng lên bản đồ.</p>
                                                    )}
                                                </div>

                                                {/* Divider */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-px bg-gray-200"/>
                                                    <span className="text-xs text-gray-400 font-medium">hoặc</span>
                                                    <div className="flex-1 h-px bg-gray-200"/>
                                                </div>

                                                {/* Map hint */}
                                                <div className="border-2 border-dashed border-yellow-400 bg-yellow-50 rounded-xl p-4 text-center">
                                                    <div className="text-3xl mb-1">📍</div>
                                                    <p className="font-semibold text-yellow-800 text-sm mb-0.5">Click trực tiếp lên bản đồ</p>
                                                    <p className="text-xs text-yellow-700">
                                                        Hoặc nhấn <strong>"Đùng GPS của tôi"</strong> để tự động xác định vị trí.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`rounded-xl border-2 overflow-hidden transition-all ${locationConfirmed ? 'border-green-500 shadow-md' : 'border-orange-400'}`}>
                                                {/* Address display */}
                                                <div className={`p-4 ${locationConfirmed ? 'bg-green-50' : 'bg-orange-50'}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${locationConfirmed ? 'bg-green-200' : 'bg-orange-200'}`}>
                                                            <svg className={`w-5 h-5 ${locationConfirmed ? 'text-green-700' : 'text-orange-700'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`font-semibold text-sm mb-1.5 ${locationConfirmed ? 'text-green-800' : 'text-orange-800'}`}>
                                                                {locationConfirmed ? '✅ Địa điểm đã xác nhận' : '⚠️ Kiểm tra và chỉnh sửa nếu cần'}
                                                            </div>
                                                            {/* Editable address textarea */}
                                                            <textarea
                                                                rows={3}
                                                                value={formData.location.addressText}
                                                                onChange={e => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        location: { ...prev.location, addressText: e.target.value }
                                                                    }));
                                                                    setLocationConfirmed(false);
                                                                }}
                                                                className="w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-400 focus:outline-none resize-none transition leading-snug"
                                                                placeholder="Địa chỉ đầy đủ..."
                                                            />
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                📌 {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLocationConfirmed(false);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    location: {
                                                                        ...prev.location,
                                                                        addressText: '',
                                                                        latitude: 10.8231,
                                                                        longitude: 106.6297
                                                                    }
                                                                }));
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 transition shrink-0 text-lg leading-none"
                                                            title="Chọn lại vị trí"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Flood depth + confirm */}
                                                <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4">
                                                    {/* Address note */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Thông tin bổ sung địa điểm
                                                            <span className="ml-1 text-gray-400 font-normal">(tùy chọn)</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressNote}
                                                            onChange={e => {
                                                                setAddressNote(e.target.value);
                                                                setLocationConfirmed(false);
                                                            }}
                                                            placeholder="VD: Số nhà 15, Hẻm 23, Tầng 2, Gần trường tiểu học..."
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition text-sm"
                                                        />
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Giúp đội cứu hộ tìm đến chính xác hơn (số nhà, hẻm, tầng, mốc nổi tiếng gần đó...)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Độ sâu nước ngập tại vị trí <span className="text-gray-400">(ước tính)</span>
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    className="w-full px-4 py-3 pr-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                                                                    value={formData.location.floodDepth}
                                                                    onChange={e => {
                                                                        const val = parseFloat(e.target.value) || 0;
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            location: { ...prev.location, floodDepth: val }
                                                                        }));
                                                                        setLocationConfirmed(false);
                                                                    }}
                                                                    placeholder="VD: 0.5"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
                                                                    mét
                                                                </span>
                                                            </div>
                                                            {/* Flood depth quick-select badges */}
                                                            <div className="flex flex-wrap gap-2">
                                                                {[0.3, 0.5, 1.0, 1.5].map(d => (
                                                                    <button
                                                                        key={d}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                location: { ...prev.location, floodDepth: d }
                                                                            }));
                                                                            setLocationConfirmed(false);
                                                                        }}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                                                            formData.location.floodDepth === d
                                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                                                        }`}
                                                                    >
                                                                        {d}m
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {/* Depth level hint */}
                                                        <div className="mt-2 flex items-center gap-2">
                                                            {formData.location.floodDepth <= 0 && (
                                                                <span className="text-xs text-gray-400">Nhập 0 nếu không xác định được</span>
                                                            )}
                                                            {formData.location.floodDepth > 0 && formData.location.floodDepth <= 0.3 && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">💧 Nước nông (&lt;= 30cm)</span>
                                                            )}
                                                            {formData.location.floodDepth > 0.3 && formData.location.floodDepth <= 0.7 && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">🌊 Ngập vừa (30–70cm)</span>
                                                            )}
                                                            {formData.location.floodDepth > 0.7 && formData.location.floodDepth <= 1.2 && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">⚠️ Ngập sâu (70cm–1.2m)</span>
                                                            )}
                                                            {formData.location.floodDepth > 1.2 && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">🚨 Nguy hiểm (&gt; 1.2m)</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Confirm button */}
                                                    {!locationConfirmed ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setLocationConfirmed(true);
                                                                setFormErrors(prev => ({...prev, location: ''}));
                                                            }}
                                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Xác nhận đây là địa điểm cần cứu hộ
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-xl px-4 py-3">
                                                            <div className="flex items-center gap-2 text-green-700 font-semibold">
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Đã xác nhận địa điểm cứu hộ
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setLocationConfirmed(false)}
                                                                className="text-xs text-gray-500 hover:text-red-500 underline transition"
                                                            >
                                                                Thay đổi
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

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
                                        disabled={loading || !locationConfirmed}
                                        className={`w-full font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg ${
                                            locationConfirmed
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
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
                                                {locationConfirmed ? 'GỬI YÊU CẦU KHẨN CẤP' : '⚠️ CHƯA XÁC NHẬN ĐỊA ĐIỂM'}
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
